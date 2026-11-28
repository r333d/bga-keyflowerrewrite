/**
 * Where a player's panel shows something, for pieces flying to or from it: the item in your own row
 * (e.g. `.kf_worker[data-kf-color="red"]`) when it's drawn, else the player's avatar, else the panel.
 * Undefined when none of them is on screen (the piece then just appears or disappears).
 */
export function panelRect(playerId: number, item?: string): DOMRect | undefined {
    const candidates = [
        item ? document.querySelector(`#overall_player_board_${playerId} .kf_private ${item}`) : null,
        document.getElementById(`avatarwrap_${playerId}`),
        document.getElementById(`overall_player_board_${playerId}`),
    ];
    return candidates.map(c => c?.getBoundingClientRect()).find(r => r && r.width > 0);
}
