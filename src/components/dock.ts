import { Boat, KFGameDatas, KFPlayer, SkillType, WorkerColor } from "../kfdata";
import { BaseComponent } from "../libs/basecomponent";
import { Html } from "../libs/html";
import { hexMark } from "../libs/hexmark";
import { TranslationComponent } from "./translation";


const COLOR_ORDER: WorkerColor[] = ['red', 'yellow', 'blue', 'green'];

/**
 * The boats, after the market: each boat tile with its passengers on the meeple outlines and its tools
 * on the "?" squares, as on the table (positions in the CSS, per boat face). The cargo is sized and
 * placed in % of the tile, so it scales with it.
 */
export class DockComponent extends BaseComponent<Boat> {

    private selectable = new Set<number>();
    private selected: number | null = null;
    /** Who took each boat this season, to show under it (not in the game data: lost on reload). */
    private owners = new Map<number, number>();

    public constructor(private bga: Bga<KFPlayer, KFGameDatas>, private translations: TranslationComponent) {
        super();
    }

    /** The boats that can be chosen now (yours to pick); an empty list makes them read-only. */
    public setSelectable(boatIds: number[]): void {
        this.selectable = new Set(boatIds);
        if (boatIds.length) { this.setOpen(true); }
        this.redrawAll();
    }

    public setSelected(boatId: number | null): void {
        this.selected = boatId;
        this.redrawAll();
    }

    public boat(boatId: number): Boat | undefined {
        return this.bga.gameui.gamedatas.dock.find(b => b.id == boatId);
    }

    /** The passengers and tools drawn on a boat, to fly them to the player who takes it. */
    public cargoElements(boatId: number): HTMLElement[] {
        return Array.from(document.querySelectorAll<HTMLElement>(`#kf_boat_${boatId} .kf_boat_item`));
    }

    /** A player took this boat: it stays where it is, empty, with their avatar under it, as in the mockup. */
    public takeBoat(boatId: number, playerId: number): void {
        const boat = this.boat(boatId);
        if (!boat) { console.error(`takeBoat: no boat ${boatId}`); return; }
        boat.passengers = [];
        boat.cargo = [];
        this.owners.set(boatId, playerId);
        this.redraw(boat);
    }

    /** Draws the boats again from the game data (a new season brings new boats and cargo). */
    public replace(): void {
        this.owners.clear();
        this.selectable.clear();
        this.selected = null;
        document.getElementById('kf_dock')?.replaceWith(this.setup());
    }

    private redrawAll(): void {
        this.bga.gameui.gamedatas.dock.forEach(b => this.redraw(b));
    }

    private redraw(boat: Boat): void {
        document.getElementById(`kf_boat_${boat.id}`)?.replaceWith(this.boatDiv(boat));
    }

    /** Opens or folds the boats (open when it's your turn to pick one, so you don't have to). */
    private setOpen(open: boolean): void {
        const boats = document.getElementById('kf_boats');
        if (!boats) { return; }
        boats.hidden = !open;
        document.getElementById('kf_dock_title')?.setAttribute('aria-expanded', String(open));
    }

    public setup(): HTMLElement {
        const dock = this.bga.gameui.gamedatas.dock;
        const open = this.isOpen();
        // The label folds the boats away, as in the mockup: they matter at the end of a season, and take
        // room the rest of it (a screen's worth on phones). Remembered on this device.
        const fold = Html.button({ id: 'kf_dock_title', classes: 'kf_dock_fold', attrs: { 'aria-expanded': open, 'aria-controls': 'kf_boats' } },
            Html.span({ classes: 'kf_chevron', attrs: { 'aria-hidden': 'true' } }),
            _('Boats'));
        const boats = Html.div({ id: 'kf_boats', classes: 'kf_boats' }, ...dock.map(boat => this.boatDiv(boat)));
        boats.hidden = !open;
        fold.addEventListener('click', () => {
            const nowOpen = boats.hidden;
            boats.hidden = !nowOpen;
            fold.setAttribute('aria-expanded', String(nowOpen));
            try { localStorage.setItem('kf-boats-open', nowOpen ? '1' : '0'); } catch { /* storage blocked: just not remembered */ }
        });
        return Html.div({ id: 'kf_dock', attrs: { role: 'group', 'aria-labelledby': 'kf_dock_title' } },
            Html.div({ classes: 'kf_dock_title', attrs: { role: 'heading', 'aria-level': 3 } }, fold),
            boats);
    }

    private isOpen(): boolean {
        try { return localStorage.getItem('kf-boats-open') !== '0'; } catch { return true; }
    }

    /**
     * The boat's tile, then its workers and tools in order; the CSS puts each on its space for that
     * boat face (data-kf-boat), so new art only means new positions in the CSS.
     */
    private boatDiv(boat: Boat): HTMLElement {
        const workers = [...boat.passengers].sort((a, b) => COLOR_ORDER.indexOf(a.color) - COLOR_ORDER.indexOf(b.color));
        const canPick = this.selectable.has(boat.id), chosen = this.selected == boat.id;
        const owner = this.owners.get(boat.id);
        const label = owner != null ? `${this.label(boat)}. ${_('Taken by ${player}').replace('${player}', this.bga.gameui.gamedatas.players[owner]?.name ?? '')}` : this.label(boat);
        const el = Html.div({ id: `kf_boat_${boat.id}`, classes: ['kf_boat', canPick ? 'kf_selectable' : '', owner != null ? 'kf_boat_taken' : ''],
                attrs: canPick
                    ? { role: 'button', tabindex: 0, 'aria-pressed': chosen, 'aria-label': label, 'data-kf-boat': boat.boattype }
                    : { role: 'img', 'aria-label': label, 'data-kf-boat': boat.boattype } },
            Html.div({ id: `kf_tile_${boat.id}`, classes: 'kf_tile', attrs: { 'data-kf-tile': boat.boattype } }),
            Html.div({ classes: 'kf_boat_workers' },
                ...workers.map(w => Html.span({ classes: ['kf_worker', 'kf_boat_item'], attrs: { 'data-kf-color': w.color } }))),
            Html.div({ classes: 'kf_boat_tools' },
                ...boat.cargo.map(s => Html.span({ classes: ['kf_boat_tool', 'kf_boat_item'], attrs: { 'data-kf-kind': s.type } }))),
            // The line around a boat you can take (on hover and focus), thicker once chosen, as on the market
            canPick ? hexMark(chosen) : undefined,
            owner != null ? Html.img({ classes: ['kf_avatar', 'kf_boat_owner'], attrs: { src: this.bga.players.getPlayerAvatarUrl(owner, 32), alt: '' } }) : undefined);
        if (canPick) {
            el.addEventListener('click', () => this.dispatch(boat));
            el.addEventListener('keydown', e => { if (e.key == 'Enter' || e.key == ' ') { e.preventDefault(); this.dispatch(boat); } });
        }
        return el;
    }

    /** For screen readers, e.g. "Keyflower: 3 red, 2 yellow, 2 blue workers; saw". */
    private label(boat: Boat): string {
        const counts = COLOR_ORDER.map(c => [c, boat.passengers.filter(w => w.color == c).length] as const).filter(([, n]) => n > 0);
        const workers = counts.length ? `${counts.map(([c, n]) => `${n} ${this.translations.color(c)}`).join(', ')} ${_('workers')}` : '';
        const tools = boat.cargo.map(s => this.translations.skill(s.type as SkillType)).join(', ');
        const cargo = [workers, tools].filter(x => x).join('; ');
        return cargo ? `${this.translations.tileName(boat.boattype)}: ${cargo}` : this.translations.tileName(boat.boattype);
    }
}
