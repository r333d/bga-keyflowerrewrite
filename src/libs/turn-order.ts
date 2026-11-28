/**
 * The number printed on each turn order tile ("Turn order 2b" shows a 2): who picks a boat first.
 * Tiles with the same number are for different player counts, so never in one market together.
 */
const TURN_ORDER_NUMBER: Record<string, number> = {
    turnorder2: 1, turnorder36: 1,
    turnorder3: 2, turnorder46: 2,
    turnorder4: 3, turnorder56a: 3,
    turnorder56b: 4,
};

/** The turn order tile's number, or undefined for any other tile. */
export const turnOrderNumber = (tiletype: string): number | undefined => TURN_ORDER_NUMBER[tiletype];

/**
 * The market in the order to show it: turn order tiles by their number (1, 2, 3…), the others as
 * the server sent them. The server sorts tiles by type name, which puts "turnorder46" (2) after
 * "turnorder4" (3).
 */
export function marketOrder<T extends { tiletype: string }>(lots: T[]): T[] {
    const rank = (t: T) => turnOrderNumber(t.tiletype) ?? 99;
    return [...lots].sort((a, b) => rank(a) - rank(b));
}
