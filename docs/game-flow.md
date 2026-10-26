# Keyflower game flow: states and decisions

As of 24 October 2026, from `main` of this repo. The game has 26 states; players decide in 12 of them, and 3 of those have everyone playing at once (village building, winter tiles, final scoring).

What the Farmers and Merchants expansions would add: [expansions.md](expansions.md) (draft).

## The year at a glance

![Flowchart of a Keyflower year: season setup leads to the player turn loop (bid or pass, or activate, then pay or choose goods, then transport or upgrade, then end turn). When all have passed: boats, then place new tiles (everyone at once), then by season: back to setup after spring or summer, winter tiles (everyone at once) after autumn, final scoring (everyone at once) and the end of the game after winter.](game-flow.png)

Spring, summer and autumn each run the same turn loop until everyone passes; then boats are taken one by one and everyone places their new tiles at once. After autumn, everyone picks winter tiles; after winter, everyone arranges their final scoring.

## Decision points

Today every choice is sent to the server as soon as it's made, so there is no undo anywhere. Only the bid and activate step asks for confirmation first.

| Step | State in code | Who | What the player decides | Confirm or undo today |
| --- | --- | --- | --- | --- |
| Bid, activate or pass | `PlayerTurn` (30) | Active player | Bid workers on a market tile, place workers on a tile to activate it, or pass | Confirm prompt before sending; no undo |
| Pay for an activation | `ProductionCost` (41) | Active player | Which goods to pay with, when there's a choice | Sent at once |
| Choose what to produce | `ProductionChoice` (43) | Active player | Which good(s) the tile produces, when it offers a choice | Sent at once |
| Transport: pick a resource | `VillageTransportA` (45) | Active player | Which resource to move, or end transport (moves left shown) | Sent at once |
| Transport: pick a destination | `VillageTransportB` (46) | Active player | Where it goes, or switch to another resource | Sent at once |
| Upgrade: pick a tile | `VillageUpgrade` (47) | Active player | Which tile to upgrade, or skip | Sent at once |
| Upgrade: pay | `VillageUpgradeChoice` (49) | Active player | Which tools to pay with | Sent at once |
| Boats | `BoatSelection` (72) | One player at a time, in turn order | Which boat to take (in winter, boats are tiles) | Sent at once |
| Free upgrade (Flipper) | `VillageUpgradeFree` (172) | Owner of the Flipper boat, end of winter | Which tile to upgrade for free, or skip | Sent at once |
| Place new tiles | `VillageConstructionA` (75) | Everyone at once | Where and which way round each won tile goes; roads and rivers must match | Turned before Ok, then sent |
| Winter tiles | `WinterSelection` (85) | Everyone at once | Which winter tiles to bring into the game | Sent at once |
| Final scoring | `ScoringSelect` (91) | Everyone at once | Move resources, workers and skills onto scoring tiles; convert the purple worker; confirm | Each move sent at once; Confirm ends it |

## Automatic steps

The server runs these on its own; players only see their result (and the waiting text in the status bar).

| State in code | What it does |
| --- | --- |
| `SeasonSetup` (10) | Deals the season's tiles to the market and cargo to the boats |
| `WorkersPlaced` (40), `VillageProduction` (42) | Checks a placement, then pays out the activated tile's goods |
| `VillageBuilding` (44) | Routes an activation to transport or upgrade |
| `VillageUpgradePayment` (48), `VillageUpgradeFreePayment` (148) | Takes payment for an upgrade |
| `EndTurn` (50) | Next player, or ends the season once everyone has passed |
| `SeasonEndA` (70) | Returns outbid workers, discards unwon tiles |
| `TurnOrder` (71) | Settles the turn order tiles and who picks a boat next |
| `SeasonEndB` (74), `SeasonEndC` (80) | Sends won tiles to villages, scores winter boats, moves to the next season |
| `YearEnd` (90) | Starts final scoring |
| `LegacyLocationSelected` (35) | Leftover from the old version; passes straight through |
