# Keyflower expansions: new decisions

As of 27 October 2026. Draft. Sources: the rulebooks for The Farmers (2013) and The Merchants (2014). Neither expansion is in the BGA code today, in the published game or in the rewrite. Promo tiles are left out.

Most new choices fit inside steps that already exist: activating a tile, transport, upgrade, boats and final scoring (see the [game flow map](game-flow.md)). A few need new decision points:

- **Contract exchange (Merchants):** a free action at any time during your own turn. It is the only action that doesn't use up the turn.
- **Hidden draws (Merchants):** face-down contracts, and the Merchant tile's look-then-choose second pick.
- **Replacing Sea Bastion II (Merchants):** one player picks a boat at the end of autumn.
- **Fields and animals (Farmers):** animals are placed and moved between fields, not tiles. Fields are areas bounded by roads, water and tile edges, and can span several tiles. This is the biggest change for both the server model and the UI.
- **Breeding (Farmers):** a new automatic step at season end. It runs before new tiles are placed, and placing a tile can merge fields and lose points.

## The Merchants

The Merchants adds 3 things. Contracts are scoring goals, each worth 7 points. Extensions upgrade an upgraded tile a second time. Cabins are extra upgrade symbols on the Home tile. There are also 6 new "II" boats; one boat of each name is picked at random.

| Decision | Who, when | Fits into | Notes |
| --- | --- | --- | --- |
| Take a face-up contract (one of 3) or the top of a face-down pile (one of 3) | Active player, on activating Assayer (spring), Bookkeeper (summer) or Merchant (autumn) | `ProductionChoice` (43) | A face-up pick is refilled from a pile at once, which everyone sees. A face-down pick is seen only by its taker. |
| Assayer: contract, iron or stone | Active player | `ProductionChoice` (43) | Upgraded: all three, so no choice of item, only which contract |
| Bookkeeper: contract or skill | Active player | `ProductionChoice` (43) | Upgraded: both. The player sees the skill before choosing a contract, so there are two steps. |
| Merchant upgraded: two contracts, one after the other | Active player | `ProductionChoice` (43), twice | The player sees the first contract (or the refill) before choosing the second |
| Exchange a contract for one specific item shown on it | Active player, any time in their own turn, as a free action | **New**: offered alongside `PlayerTurn` (30) | Resource goes to Home; worker or skill goes behind the screen. Items in white ("any of that type") can't be taken. The exchanged contract is discarded face up. |
| Use an upgrade symbol for an extension instead of an upgrade | Active player, after activating a tile with upgrade symbols | `VillageUpgrade` (47) gets a second option | Each symbol is used once per turn, for one or the other. Wainwright (2 symbols) can do one of each. |
| Which extension and which tile | Active player | `VillageUpgrade` (47) | 18 extensions, each with its own cost. The target must be an upgraded tile in their own village with no extension yet. Its colour must match any workers already on the tile. |
| Pay for the extension | Active player | `VillageUpgradeChoice` (49), extended | Resources must already be on the target tile, so transport comes first. Workers or skills come from stock: not workers placed in the village this season, but outbid workers are allowed, kept together, and may overpay. |
| Which boat to take | One player at a time | `BoatSelection` (72) | Boats now carry cabins, gold, green workers and face-down contracts (shown as "?") |
| Replacement for Sea Bastion II | The player who took it, end of autumn | **New** single-player step after `BoatSelection` (72) | Any boat not already in the game, base or II. It is the boat that's chosen in winter. |
| Flipper II: which extension, on which upgraded tile | Its owner, final scoring | Like `VillageUpgradeFree` (172) | Free, and no colour matching is needed. There is no choice when no upgraded tile is free. |
| Allocate items to contracts | Everyone at once, final scoring | `ScoringSelect` (91), contracts become targets | Each item scores once, across winter tiles, boats and contracts. With Muleteer, unfinished contracts score 3 each, so leaving a contract unfinished can be a choice. |

Automatic, no decision:

- Cabins go on the Home tile, each as an extra upgrade symbol that anyone activating the tile can use.
- After an extension, only that colour can be placed on the tile (boat 4b ignores this).
- The 3 face-up contracts are replaced at the end of spring, summer and autumn.
- More winter tiles are dealt: 4 each with 2 or 3 players, 3 with 4 or 5, and 2 with 6. With both expansions, the Farmers numbers apply instead.
- Artisan, Builder and Muleteer only score.

## The Farmers

The Farmers adds animals (sheep, pigs, cows) that live in fields, and wheat, which is held like skills and spent for extra transport. A field is an area bounded by roads, water and unconnected tile edges, and it can span several tiles. Each field scores once for each type of animal in it, so animals in many fields score more than many animals in one field.

**Fields from today's data:** checked against the art of all 64 base tiles, a tile's fields can be worked out from the edge types the game already stores (`tile_edgetype1`–`6`). The roads on a tile meet in the middle, so its fields are the stretches of border between consecutive roads. A river splits a tile only when it crosses it (boats). The single river edge on a Home tile is an inlet that one field wraps around, which gives the 5 fields per Home tile the rulebook describes. Fences, walls and streams inside a tile don't count. Across tiles, grass edges join fields, a road edge joins the fields on each side of the road, and a river edge joins nothing. So fields need a function, not new tile data. Item locations could get an optional field now, so animals don't need a migration later.

| Decision | Who, when | Fits into | Notes |
| --- | --- | --- | --- |
| Which field a new animal goes into | Active player, on activating a tile that produces animals | `VillageProduction` (42) or `ProductionChoice` (43) | From your own tile: a field on that tile. From someone else's village or the market: a field on your Home tile. The field must be empty or hold the same type. Several animals can be split across fields. No valid field means no animal. Often only one field fits, so it can be automatic. |
| Farm yard: sheep, wheat or skill | Active player | `ProductionChoice` (43) | Upgraded: all three |
| Move animals with transport | Active player, on a transport activation | `VillageTransportA`/`B` (45/46), extended | Transport points are shared between resources and animals. Each field entered costs 1. Two fields are adjacent if one tile contains both. An animal may pass through a field with another type but can't stop there. The destination is a field, not a tile. |
| Spend wheat for extra transport | Active player, on a transport activation | `VillageTransportA` (45) | +1 move per wheat, not doubled by boat 2b. Paddock gives wheat that can be spent on the same turn. |
| Put sheep into the Sheep shelter | Owner, during the game | Unclear (see Open rules questions) | The sheep score per sheep, not per field. This can't be done at the end of the game. |
| Boat 6b: which Home field gets the pig and the sheep | Owner, end of summer and autumn (and when taking a boat in winter) | **New** step after `TurnOrder` (71), before breeding | If no field fits, that animal isn't taken |
| Where each won tile goes | Everyone at once | `VillageConstructionA` (75) | New risk: joining two fields that hold the same type of animal turns 2 scoring fields into 1. Joining different types is allowed. A warning like the river warning fits here. |
| Final scoring choices | Everyone at once | `ScoringSelect` (91) | The purple marker can also count as an animal (in any field) or as wheat. With boat 5b, wheat and resources count as each other. With Weaver, one sheep can stay out of the shelter so its field scores. Animals can't be moved. |

Automatic, no decision:

- **Breeding:** at the end of spring, summer and autumn, any field with 2 or more animals of one type (and no other type) gains 1 more. If animals run short, they are given out in turn order. There is no breeding in winter.
- **Turn order tiles 1 to 3:** these come in a new version that also gives the resources shown, collected with the boat contents. They can't be activated.
- **Boat 6a:** 2 wheat at the end of summer and autumn, and when taking a boat in winter.
- **Boat 5a:** animals of different types may share a field and still breed. This only changes validation.
- **Winter tiles:** 4 each with 2 to 4 players, and 3 with 5 or 6.
- Dairy, Truffle orchard, Weaver, Granary, Bakery and Hillside only score. Hillside needs the field model too.

## Who plays when

Neither expansion adds an everyone-at-once step. They add two single-player choices at season end, plus one free action during turns.

**During turns:** it's still one action per turn. The exception is a contract exchange, which can happen any number of times in your own turn without using it up.

**Season end**, in the order the Merchants rulebook gives (it covers both expansions; new steps are marked):

1. Outbid workers go back to their owners.
2. Tiles nobody bid for are discarded.
3. Won tiles are claimed, one player at a time from the start player.
4. Workers in villages go back behind screens.
5. Turn order tiles and boats, one player at a time. Contracts go behind the screen; cabins and gold go on the Home tile. *Farmers: turn order tiles also give resources.*
6. Boat 1 and *boat 6 (Farmers)* pay out. **New:** the boat 6b owner picks the Home fields for the pig and the sheep.
7. *Farmers, not in winter:* breeding (automatic).
8. Everyone places their won tiles at once. Breeding has already happened, so joining fields now can't undo it, but it can cost scoring.
9. *Merchants, not in winter:* the face-up contracts are replaced (automatic).

**After autumn's boats (Merchants):** if Sea Bastion II is in play, its taker picks the boat that replaces it for winter. This only affects winter, so it could run while everyone places tiles. Nobody would have to wait.

## Pending moves and undo

The hardest part is hidden information. Once a player has seen a face-down contract, undoing the pick would let them choose again knowing what's in the pile. The base game already has this problem with workers drawn from the bag (Alehouse, Inn, Tavern), so whatever rule covers those can cover contracts too.

1. **Hidden draws.** Face-down contracts, the refill after a face-up pick, and the Bookkeeper's "see the skill first" all reveal something new. There are two options: the pending batch ends at the reveal, or the pick is stored as "pile 2" and only drawn at commit. The upgraded Merchant needs a commit between its two picks either way, because the second choice depends on the first. Proposal: do what Ark Nova does and ask for confirmation just before anything is revealed, for example "This draws from the bag and can't be undone." Keyflower already shows a confirmation prompt for each bid and activation, so it could switch to a warning version for these actions instead of adding a second dialog. When there is nothing to undo yet, the warning can be skipped.
2. **Free actions inside a turn.** A contract exchange can make the turn's action possible, for example by giving the worker colour or resource it needs. Undo has to unwind both together. It's also unclear whether an exchange is allowed in the middle of transport or upgrade steps (see Open rules questions).
3. **Order inside a turn matters.** An extension needs its resources already on the target tile, so transport has to run first in the same activation. A pending batch has to keep that order and check each step against the state the steps before it leave.
4. **Fields are derived state.** Fields change whenever a tile is placed. During tile placement (everyone at once), each player's pending placements change their own fields, so scoring warnings can be worked out on the client before commit. That fits the staged placement prototype.
5. **Breeding runs on the village before placement.** If the rewrite merges or reorders the season-end steps, breeding still has to see villages without the new tiles.
6. **Shared, limited supplies.** These are animals (12 cows, 24 pigs, 32 sheep), 30 wheat, 18 one-off extensions, 6 cabins and the contract piles. During turns only one player acts, so pending moves can't collide. At season end, shortages follow turn order. Flipper II is the only extension choice made in a simultaneous step, and only one player can own it.
7. **Colour locks.** After an extension, only that colour can be placed on the tile for the rest of the game. Placement checks need to read it, and boat 4b ignores it.

## Open rules questions

The rulebooks don't settle these. The BGG forums or the publisher could:

- [ ] **Sheep shelter:** when can sheep be put into it? The rules only say "during the game", not as part of which action.
- [ ] **Contract exchange:** does "at any time during their turn" include the middle of a transport or upgrade step?
- [ ] **Hillside:** does the Hillside tile count itself? The rulebook example counts "six additional tiles", but one summary says "including this tile".
- [ ] **Boat 2a:** it lets resources travel across fields. Does it let animals do the same?
- [ ] **Breeding:** the Merchants rulebook says animals "may breed". Is it optional, or always automatic?

## Tile summaries checked

Two third-party tile summaries were checked against the rulebooks. Both match wherever the rulebook text gives a value. Many values, such as Sheep fold giving 1 or 2 sheep, are printed only on the tiles; the rules just say "the number indicated", so those couldn't be checked. Differences:

| Summary | Says | Rulebook or code | Verdict |
| --- | --- | --- | --- |
| Merchants summary | Barn: 2 points per resource (3 upgraded) | The code (`Game.php`) and the Farmers summary: 1 (2 upgraded) | Summary is wrong |
| Merchants summary | Hillside counts "including this tile" | The rulebook example counts "six additional tiles" | Unclear: listed under Open rules questions |
| Merchants summary | Promo tiles (Sorcerer, Developer, boats 7a and 7b, Key Celeste, Keymelequin and others) | Not in these rulebooks | Not checked |
| Farmers summary | Boat 6b animals "reproduce at the end of the season" | They arrive before breeding, so they can breed with animals already in that field. There is no breeding in winter. | Simplified |
| Farmers summary | Boat 2b doubles Keyflower boat scoring | A base game rule, not covered here. The Farmers rulebook adds that wheat moves aren't doubled. | Not checked |
