import { AnimationManager } from "../bgalibs/bga-animations";
import { DockComponent } from "../components/dock";
import { MarketComponent } from "../components/market";
import { PanelsComponent } from "../components/panels";
import { TranslationComponent } from "../components/translation";
import { VillageComponent } from "../components/village";
import { Boat, KFGameDatas, KFPlayer, Skill, Worker } from "../kfdata";
import { MoreAnimations } from "../libs/more-animations";
import { panelRect } from "../libs/panel-rect";
import { BaseState } from "./base";

/**
 * Gives workers and tools to a player. Only your own stock is sent to you, so only yours changes;
 * the others' panels show no stock.
 */
function giveToStock(bga: Bga<KFPlayer, KFGameDatas>, playerId: number, workers: Worker[], skills: Skill[] = []): void {
    const village = bga.gameui.gamedatas.villages[playerId];
    if (village?.workers) {
        const have = new Set(village.workers.map(w => w.id));
        village.workers = [...village.workers, ...workers.filter(w => !have.has(w.id))];
    }
    if (village?.skills) {
        const have = new Set(village.skills.map(s => s.id));
        village.skills = [...village.skills, ...skills.filter(s => !have.has(s.id))];
    }
}

/** Where a player's workers of this color (or tools) show in their panel. */
const workersRect = (playerId: number, workers: Worker[]) =>
    panelRect(playerId, workers[0] ? `.kf_worker[data-kf-color="${workers[0].color}"]` : undefined);

/**
 * The end of the season (#68), as in the mockup, one step after the other: losing bids go back to
 * their players, tiles nobody bid on leave, won tiles go to their winners' "Won this season" strip
 * (the workers used on them to the winner), then workers come off the village tiles to their owners.
 * Each notification only sends ids: the client already has the bids, the uses and who owns what.
 */
export class EndOfSeasonState extends BaseState {

    constructor(bga: Bga<KFPlayer, KFGameDatas>, animationManager: AnimationManager,
        private market: MarketComponent, private villages: VillageComponent, private panels: PanelsComponent,
        private animations: MoreAnimations) {
        super(bga, animationManager);
    }

    async notif_losingBidsReturned(args: { losing_bids: { lot_id: number, player_ids: number[] }[] }) {
        const flights: Promise<void>[] = [];
        for (const { lot_id, player_ids } of args.losing_bids) {
            for (const pid of player_ids) {
                const workers = this.market.bidWorkers(lot_id, pid);
                const el = this.market.shownBid(lot_id, pid);
                // The copy flies from where the bid is drawn; the bid itself leaves its tile at once.
                if (el) { flights.push(this.animations.flyAway(el, workersRect(pid, workers))); }
                giveToStock(this.bga, pid, workers);
                this.market.removeBid(lot_id, pid);
            }
        }
        await Promise.all(flights);
        this.panels.updatePrivateRow();
    }

    async notif_discardingUnbidLots(args: { discarded_lot_ids: number[] }) {
        // Workers used on them go to the bag: nothing to show for them but the tile leaving.
        await Promise.all(args.discarded_lot_ids.map(id => {
            const el = this.market.lotElement(id);
            return el ? this.animations.fadeOut(el) : Promise.resolve();
        }));
        args.discarded_lot_ids.forEach(id => this.market.removeLot(id));
    }

    async notif_wonTilesAwarded(args: { awarded_tiles: { lot_id: number, player_id: number }[] }) {
        // First the workers used on each tile go to its winner, and the winning bid to the bag.
        await Promise.all(args.awarded_tiles.map(async ({ lot_id, player_id }) => {
            const used = this.market.usedWorkers(lot_id);
            const uses = this.market.usesElement(lot_id);
            const bid = this.market.shownBid(lot_id, player_id);
            giveToStock(this.bga, player_id, used);
            await Promise.all([
                uses ? this.animations.flyAway(uses, workersRect(player_id, used)) : Promise.resolve(),
                bid ? this.animations.fadeOut(bid) : Promise.resolve(),
            ]);
        }));
        this.panels.updatePrivateRow();
        // Then each tile moves to its winner's strip.
        await Promise.all(args.awarded_tiles.map(async ({ lot_id, player_id }) => {
            const tiletype = this.market.tile(lot_id)?.tiletype;
            const from = document.getElementById(`kf_tile_${lot_id}`)?.getBoundingClientRect();
            this.market.removeLot(lot_id);
            if (!tiletype) { console.error(`wonTilesAwarded: no market tile ${lot_id}`); return; }
            const el = this.villages.addWonTile(player_id, { tile_id: lot_id, tiletype });
            if (el && from) { await this.animations.animateMove(el, from); }
        }));
    }

    async notif_collectActivatedWorkers(args: { tiles_with_workers: { player_id: number, tile_ids: number[] }[] }) {
        const flights: Promise<void>[] = [];
        for (const { player_id, tile_ids } of args.tiles_with_workers) {
            for (const id of tile_ids) {
                const workers = this.villages.usedWorkers(id);
                const el = this.villages.usesElement(id);
                if (el) { flights.push(this.animations.flyAway(el, workersRect(player_id, workers))); }
                giveToStock(this.bga, player_id, workers);
                this.villages.clearUses(id);
            }
        }
        await Promise.all(flights);
        this.panels.updatePrivateRow();
    }
}

/**
 * Choosing a boat (#68's SelectBoat), as the bid picker does: tap a boat, then Take or Cancel in the
 * status bar. The boats you can take get an outline; the boats unfold if you'd folded them away.
 */
export class SelectBoatState extends BaseState {

    private chosen: Boat | null = null;
    private onBoat = (boat: Boat) => this.choose(boat);

    constructor(bga: Bga<KFPlayer, KFGameDatas>, animationManager: AnimationManager,
        private dock: DockComponent, private panels: PanelsComponent, private translations: TranslationComponent,
        private animations: MoreAnimations) {
        super(bga, animationManager);
    }

    override onEnteringState(args: { available_boat_ids: number[] }, isCurrentPlayerActive: boolean): void {
        if (!isCurrentPlayerActive) { return; }
        this.dock.addHandler(this.onBoat);
        this.dock.setSelectable(args.available_boat_ids ?? []);
    }

    override onLeavingState(args: any, isCurrentPlayerActive: boolean): void {
        this.dock.removeHandler(this.onBoat);
        this.dock.setSelectable([]);
        this.dock.setSelected(null);
        this.chosen = null;
    }

    private choose(boat: Boat): void {
        this.chosen = boat;
        this.dock.setSelected(boat.id);
        this.bga.statusBar.setTitle(_('Take ${boat}'), { boat: this.translations.tileName(boat.boattype) });
        this.bga.statusBar.removeActionButtons();
        this.bga.statusBar.addActionButton(_('Take'), () => this.bga.actions.performAction('actSelectBoat', { tile_id: boat.id }));
        this.bga.statusBar.addActionButton(_('Cancel'), () => this.cancel(), { color: 'alert', classes: 'kf_cancel' });
    }

    private cancel(): void {
        this.chosen = null;
        this.dock.setSelected(null);
        const gs = this.bga.gameui.gamedatas.gamestate as any;
        this.bga.statusBar.setTitle(gs.descriptionmyturn ?? '', gs.args);
        this.bga.statusBar.removeActionButtons();
    }

    /** A boat taken: its passengers and tools fly to the player, and it stays, empty, with them under it. */
    async notif_boatSelected(args: { player_id: number, boat_id: number, passengers: Worker[], cargo: Skill[] }) {
        const to = workersRect(args.player_id, args.passengers);
        const flights = this.dock.cargoElements(args.boat_id).map(el => this.animations.flyAway(el, to));
        giveToStock(this.bga, args.player_id, args.passengers ?? [], args.cargo ?? []);
        this.dock.takeBoat(args.boat_id, args.player_id);
        await Promise.all(flights);
        this.panels.updatePrivateRow();
    }
}

/** Turn order tiles and boats are worked out on the server; nothing to show between them yet. */
export class TurnOrderAndUnloadBoatsState extends BaseState {}

/**
 * Placing won tiles (#68's ExpandVillages) isn't built yet on either side: for now a Confirm button,
 * so a game can go on to the next season.
 */
export class ExpandVillagesState extends BaseState {
    override onEnteringState(args: any, isCurrentPlayerActive: boolean): void {
        if (!isCurrentPlayerActive) { return; }
        this.bga.statusBar.addActionButton(_('Confirm'), () => this.bga.actions.performAction('actConfirm'));
    }
}
