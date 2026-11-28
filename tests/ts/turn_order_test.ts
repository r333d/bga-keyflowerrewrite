import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { marketOrder, turnOrderNumber } from '../../src/libs/turn-order';

const lots = (...types: string[]) => types.map(tiletype => ({ tiletype }));
const types = (ls: { tiletype: string }[]) => ls.map(l => l.tiletype);

describe('turn order', () => {
    it('reads the number printed on each turn order tile', () => {
        assert.equal(turnOrderNumber('turnorder36'), 1);
        assert.equal(turnOrderNumber('turnorder46'), 2);
        assert.equal(turnOrderNumber('turnorder4'), 3);
        assert.equal(turnOrderNumber('woodcutter'), undefined);
    });

    it('shows turn order tiles by number, before the others, which keep their order', () => {
        assert.deepEqual(
            types(marketOrder(lots('turnorder36', 'turnorder4', 'turnorder46', 'quarryman', 'stable', 'keymine'))),
            ['turnorder36', 'turnorder46', 'turnorder4', 'quarryman', 'stable', 'keymine']);
        assert.deepEqual(
            types(marketOrder(lots('woodcutter', 'turnorder56b', 'turnorder56a', 'turnorder46', 'turnorder36'))),
            ['turnorder36', 'turnorder46', 'turnorder56a', 'turnorder56b', 'woodcutter']);
    });

    it('leaves the market it was given alone', () => {
        const market = lots('turnorder4', 'turnorder46');
        marketOrder(market);
        assert.deepEqual(types(market), ['turnorder4', 'turnorder46']);
    });
});
