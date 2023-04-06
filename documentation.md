# Doodlebot UI project documentation

Technologies used: HTML, CSS, JavaScript, Sockets, OpencvJS

The most important thing is the concept of a `VirtualGrid`. The `VirtualGrid` (defined in [virtual-board/grid.js](./virtual-board/grid.js)) is the internal representation of everything that happens in the game (either the fully-virtual version or the one reading from the video stream). You can initialize a `VirtualGrid` like

```javascript
grid = new VirtualGrid(rows, cols, options)
```
where `rows` and `cols` are integers, and `options` is an Object with the fields below, useful to initialize a grid from another grid. At any given point, the grid has the following properties:

| Field            | Description                                                                                                                                                                                 | Example                 |
|------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------|
| bots             | An object representing all of the bots. It's a map from `bot_id` to an array of all bots in the grid.                                                                                       | {1: [BotObject]}        |
| obstacles        | Same as bots, but with `ObstacleObject`s                                                                                                                                                    | {11: [ObstacleObject]}  |
| coins            | Same as bots, but with `CoinObject`s                                                                                                                                                        | {21: [CoinObject]}      |
| rows             | Number of rows                                                                                                                                                                              | 16                      |
| cols             | Number of columns                                                                                                                                                                           | 16                      |
| onPickupCoin     | Called when a coin is picked up. This is called on `grid.move_bot` and `grid.update_bot` methods.                                                                                           | (bot, coin) => {}       |
| onAddBot         | Called when a bot is added. This is called on `grid.add_bot` method.                                                                                                                        | (bot) => {}             |
| onAddObstacle    | Called when an obstacle is added. This is called on `grid.add_obstacle` method.                                                                                                             | (obstacle) => {}        |
| onAddCoin        | Called when a coin is added. This is called on `grid.add_coin` method.                                                                                                                      | (coin) => {}            |
| onRemoveBot      | Called when a bot is removed. This is called on `grid.remove_bot` method.                                                                                                                   | (removedBot) => {}      |
| onRemoveObstacle | Called when an obstacle is removed. This is called on `grid.remove_obstacle` method.                                                                                                        | (removedObstacle) => {} |
| onRemoveCoin     | Called when a coin is removed. This is called on `grid.remove_coin` method.                                                                                                                 | (removedCoin) => {}     |
| onUpdateObject   | Called when an object (bot, obstacle or coin) is updated. This is called on `grid.update_{bot\|obstacle\|coin}`                                                                             | (updatedObject) => {}   |
| onApplyMoveToBot | Called when a move is applied to a bot, like `grid.apply_next_move_to_bot(1, ['turn', 90])`. Currently used to  send this info over sockets so that all other clients get the same command. | (bot_id, move) => {}    |

It's worth noting that even though `grid.bots`, `grid.obstacles` and `grid.coins` accept array of bots per `bot_id`, that array is always of length 1. This means that, for example, to get the obstacle with id 11 you'd do `grid.bots[11][0]`. This was because on early development I thought I was going to have multiple obejcts with the same id, but I have now decided it's better to keep all of them different.

## BotObject
| Field            | Description                                                                                                                                                     | Example |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| id               | id of bot. Often an integer                                                                                                                                     | 1       |
| real_bottom_left | [col, row]. Coordinates of the bottom left corner of the bot                                                                                                    | [2, 3]  |
| width            | width of bot                                                                                                                                                    | 3       |
| height           | height of bot                                                                                                                                                   | 3       |
| relative_anchor  | Coordinates of the anchor of the bot. On the virtual version it's often the center, but in the physical version it depends on where the Aruco codes are placed. | [1, 1]  |
| angle            | The direction the bot is looking at. It can only be 0 (RIGHT), 90 (UP), 180 (LEFT) or 270 (DOWN)                                                                | 90      |
| realAngle        | Same as `angle` but now it can be any number on [0, 360). This is usually relevant on the physical version.                                                     | 63      |
| isMoving        | Whether the current bot is moving or not | false      |
| ...other fields  |                                                                                                                                                                 |         |
## ObstacleObject
| Field            | Description                                                                                                                                                     | Example |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| id               | id of obstacle. Often an integer                                                                                                                                     | 11       |
| real_bottom_left | [col, row]. Coordinates of the bottom left corner of the obstacle                                                                                                    | [2, 3]  |
| width            | width of obstacle                                                                                                                                                    | 3       |
| height           | height of obstacle                                                                                                                                                   | 3       |
## CoinObject
| Field            | Description                                                                                                                                                     | Example |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| id               | id of coin. Often an integer                                                                                                                                     | 21       |
| real_bottom_left | [col, row]. Coordinates of the bottom left corner of the coin                                                                                                    | [2, 3]  |
| width            | width of coin                                                                                                                                                    | 3       |
| height           | height of coin                                                                                                                                                   | 3       |
## Methods

### `grid.toJSON()`
Converts the grid into a JSON representation. This can be used to make sure two clients start with the same information. Something like:
```javascript
//Client 1, send this info through Sockets
let {rows, cols, bots, obstacles, coins} = grid.toJSON();

//Client 2, replicate this info
grid = new VirtualGrid(rows, cols, {bots, obstacles, coins})
```
<!-- ### `grid.get_bot_angle`
### `grid.get_almost_crashes` -->
### `grid.change_moving_status`
Stops a bot if it's moving, starts it if it's not moving. When pressing `start` this method should be called on all bots.

<!-- ### `grid.isInsideBoard(bottom_left, w, h)`
Returns whether an object with `bottom_left` and dimensions `[w, h]` would fall fully inside the grid. -->

### `grid.add_random_bot()`
Adds a bot with random id. For now only the position and angle are random, the dimensions are set to `[3, 3]` and the anchor is set to `[1, 1]` (its center)
### `grid.add_random_obstacle()`
Adds an obstacle with random id. The `width`, `height` and `real_bottom_left` are all randomized. 
### `grid.add_random_coin()`
Adds a coin with random id. For now only the position is random, and the `width` and `height` are set to 1. 

<!-- ### `grid.future_position_after_move(prev_bot, distance)`
Returns where the bot would end up after walking `distance` steps on the direction is looking. A `valid_position` boolean field is added to see if this position is a valid position or not. -->
### `grid.update_bot(bot_id, update)`
Updates the position/angle of the bot with id `bot_id`. Currently `update` can have `real_anchor`, `angle` and `realAngle` fields. `real_anchor` usually comes from the (new) position of an Aruco code. Like when moving, it will pick up any coins it crashes on its final position.
### `grid.update_obstacle(obstacle_id, update)`
If `update` has `{new_anchor}` then it will only update that, else it will add all the update on the obstacle.
### `grid.update_coin(obstacle_id, update)`
If `update` has `{new_anchor}` then it will only update that, else it will add all the update on the coin.

<!-- 
### `grid.update_bot_policy)`
... toehr methods -->

### `grid.get_next_move_using_policies(bot_id, num_turns)`
Returns the next move the bot should do. The result is either `['move', distance]` (e.g., `['move', 1])` or `['turn', angle]` (e.g., `['turn', 90]`). The decision of which move to do is depndent on the policies this bot has.
### `grid.apply_next_move_to_bot(bot_id, move)`
Applies the `move` (same format as `get_next_move_using_policies`) to the bot with id `bot_id`.
