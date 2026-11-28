import { AnimationManager } from "../bgalibs/bga-animations";
import { DockComponent } from "../components/dock";
import { MarketComponent } from "../components/market";
import { PanelsComponent } from "../components/panels";
import { Dock, KFGameDatas, KFPlayer, Market, Season } from "../kfdata";
import { BaseState } from "./base";

export class SeasonSetupState extends BaseState {

    constructor(bga: Bga<KFPlayer, KFGameDatas>, animationManager: AnimationManager,
        private market: MarketComponent, private dock: DockComponent, private panels: PanelsComponent) {
        super(bga, animationManager);
    }

    /**
     * A new season: its market and boats replace the old ones, the season's color and name follow,
     * and the start player's meeple moves if it changed hands.
     */
    async notif_newSeason(args: { season: Season, startPlayerId: number, dock: Dock, market: Market }) {
        const gamedatas = this.bga.gameui.gamedatas;
        gamedatas.season = args.season;
        gamedatas.market = args.market;
        gamedatas.dock = args.dock;
        Object.values(gamedatas.villages).forEach(v => v.has_start_player = v.player_id == args.startPlayerId);
        this.market.replace();
        this.dock.replace();
        this.panels.setStartPlayer(args.startPlayerId);
        const bar = document.getElementById('page-title');
        if (bar) { bar.dataset['kfSeason'] = args.season; }
    }
}
