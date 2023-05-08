/**
 * Abstract representation of a directed-weighted graph
 */
class Graph {
  constructor() {
    this.graph = {};
  }
  /**
   * Adds a node to a graph, in case it doesnt exist yet
   * @param {String} node
   */
  addNode(node) {
    if (!Object.keys(this.graph).includes(node)) {
      this.graph[node] = {};
    }
  }
  /**
   * Adds an edge from start to end with a given weight and an extra
   *
   * @param {String} start
   * @param {String} end
   * @param {Number} weight
   * @param {Object} info
   */
  addDirectedEdge(start, end, weight, info = {}) {
    this.addNode(start);
    this.addNode(end);
    this.graph[start][end] = { weight, info };
  }
  /**
   * Adds both edges from start to end and end with start
   *
   * @param {String} start
   * @param {String} end
   * @param {Number} weight
   * @param {Object} info
   */
  addEdge(start, end, weight, info = {}) {
    this.addDirectedEdge(start, end, weight, info);
    this.addDirectedEdge(end, start, weight, info);
  }
  /**
   *
   * @param {string} start
   * @param {string} end
   */
  shortestPath(start, end) {
    // console.log(`Finding shortest path from ${start} to ${end}`);
    return findShortestPath(this.graph, start, end);
  }
}

function interpolate(breakpoints, values) {
  if (breakpoints.length !== values.length) {
    console.log(
      `The breakpoints should have a length (${breakpoints.length}) the same as the values input (${values.length})`
    );
  }
  let res = "";
  for (let i = 0; i < values.length; i++) {
    res += String(breakpoints[i]);
    res += String(values[i]);
  }
  return res;
}
/**
 *
 * @param {*} string bp1 + val1 + bp2 + val2 + bp3 + val3 +...
 * @param {*} breakpoints bp1, bp2, bp3...
 * @returns val1, val2, val3,...
 */
function getStringParts(string, breakpoints) {
  let output = [];
  for (let i = 0; i < breakpoints.length; i++) {
    // console.log(`Trying to find match for ${breakpoints[i]}`);
    let index = string.indexOf(breakpoints[i]);
    if (index === -1) {
      return null;
    }
    let startResponse = index + breakpoints[i].length;
    if (i === breakpoints.length - 1) {
      part = string.slice(startResponse, string.length);
    } else {
      let nextIndex = string.indexOf(breakpoints[i + 1], startResponse);
      if (nextIndex === -1) {
        return null;
      }
      part = string.slice(startResponse, nextIndex);
      string = string.slice(nextIndex);
    }
    // console.log(`Found ${part}`);
    output.push(part);
  }
  return output;
}
const NODE_BREAKPOINTS = ["i->", ", j->", ", angle->"];
/**
 * Representation of the graph related with a given grid from a bot's point of view. Anything different than the bot
 * is considered an "obstacle", meaning that one can't pass through that.
 */
class GridGraph {
  /**
   *
   * @param {*} graph
   */
  constructor(grid, coin, bot_dimensions) {
    this.grid = grid;
    this.graph = new Graph();
    this.distances = {}; //node -> distance

    // this.update_values_from_grid(grid, bot_id, bot_index);
    // this.update_values_from_grid_binary_board(grid, bot_id, bot_index);
    this.update_graph(grid, bot_dimensions);
    this.update_distances_to_crash(grid, bot_dimensions, coin);
  }
  get_node_from_position(i, j, angle) {
    return interpolate(NODE_BREAKPOINTS, [i, j, angle]);
  }
  get_position_from_node(node) {
    return getStringParts(node, NODE_BREAKPOINTS).map(Number);
  }
  /**
   * Adds nodes and edges taking into account reachability and not being on top of obstacles
   *
   * @param {*} grid
   * @param {*} bot_dimensions
   */
  update_graph(grid, bot_dimensions) {
    let crashing_board = grid.binary_crashing_board(bot_dimensions, false);
    // const isInsideBoard = (i, j) => 0 <= i && i < grid.cols && 0 <= j && j < grid.rows;
    // const isValidPosition = (i, j) => !isInsideBoard(i, j) || !crashing_board[j][i];
    const isValidPosition = (i, j) =>
      0 <= i &&
      i < grid.cols &&
      0 <= j &&
      j < grid.rows &&
      !crashing_board[j][i];
    for (let j = 0; j < grid.rows; j++) {
      for (let i = 0; i < grid.cols; i++) {
        if (!isValidPosition(i, j)) {
          continue;
        }
        for (let angle of [0, 90, 180, 270]) {
          let start_node = this.get_node_from_position(i, j, angle);
          let start_bot = {
            angle: angle,
            real_bottom_left: [i, j],
          };
          let possible_moves = [
            {
              info: ["move", 1],
              weight: 1,
              end_position: this.future_position_after_move(start_bot, 1),
            },
            {
              info: ["turn", 90],
              weight: 1,
              end_position: this.future_position_after_turn(start_bot, 90),
            },
            {
              info: ["turn", -90],
              weight: 1,
              end_position: this.future_position_after_turn(start_bot, -90),
            },
          ];
          for (let { info, weight, end_position } of possible_moves) {
            let [end_i, end_j] = end_position.real_bottom_left;
            let end_angle = end_position.angle;
            if (!isValidPosition(end_i, end_j)) {
              continue;
            }
            let end_node = this.get_node_from_position(end_i, end_j, end_angle);
            // From end to start because we will start with the coin
            this.graph.addDirectedEdge(end_node, start_node, weight, info);
          }
        }
      }
    }
  }
  /**
   * For every node, get the minimum distance between the one that is already computed
   * and the one that comes from `distances`
   *
   * @param {*} distances {node: Number}
   * @returns
   */
  update_distance_values(distances) {
    if (Object.keys(distances).length === 0) {
      //If no distances avaialble, don't update anything
      return;
    }
    if (Object.keys(this.distances) == 0) {
      this.distances = distances;
      return;
    }
    //Update distances as the minimum of all possibilities
    let newDistances = {};
    for (let key in this.distances) {
      if (key in distances) {
        newDistances[key] = Math.min(this.distances[key], distances[key]);
      }
    }
    this.distances = newDistances;
  }
  /**
   * Store minimum distances from each cell so that the bot crashes with coin, by finding the minimum
   * distance it takes for a cell to go to any cell that will make its front crash with the coin
   *
   * @param {*} grid grid object
   * @param {*} bot_dimensions {width: , height}
   * @param {*} coin
   */
  update_distances_to_crash(grid, bot_dimensions, coin) {
    let boundaries_per_angle = grid.get_crashing_bounds_front(
      bot_dimensions,
      coin
    );
    //boundaries to crash
    // let [min_bot_x, min_bot_y, max_bot_x, max_bot_y] = grid.get_crashing_bounds(bot_dimensions, coin);
    // coin has no angle and so should be added
    // for (let new_x = min_bot_x; new_x <= max_bot_x; new_x++){
    //     for (let new_y = min_bot_y; new_y <= max_bot_y; new_y++){
    //         for (let coin_angle of [0, 90, 180, 270]){
    for (let coin_angle in boundaries_per_angle) {
      //boundaries to crash
      let [min_bot_x, min_bot_y, max_bot_x, max_bot_y] =
        boundaries_per_angle[coin_angle];
      for (let new_x = min_bot_x; new_x <= max_bot_x; new_x++) {
        for (let new_y = min_bot_y; new_y <= max_bot_y; new_y++) {
          let start_node = this.get_node_from_position(
            new_x,
            new_y,
            coin_angle
          );
          let { distances } = findShortestPathDistances(
            this.graph.graph,
            start_node
          );
          //Distances would be an empty {} if the start_node is an invalid node (crashing)
          if (Object.keys(distances).length > 0) {
            this.update_distance_values(distances);
          }
        }
      }
    }
  }
  /**
   * Store minimum distances from each cell to crash with coin, by finding the minimum
   * distance it takes for a cell to go to any cell that will make it crash with the coin
   *
   * @param {*} grid grid object
   * @param {*} bot_dimensions {width: , height}
   * @param {*} coin
   */
  update_distances_to_crash_front(grid, bot_dimensions, coin) {
    //boundaries to crash
    let [min_bot_x, min_bot_y, max_bot_x, max_bot_y] = grid.get_crashing_bounds(
      bot_dimensions,
      coin
    );
    // coin has no angle and so should be added
    for (let new_x = min_bot_x; new_x <= max_bot_x; new_x++) {
      for (let new_y = min_bot_y; new_y <= max_bot_y; new_y++) {
        for (let coin_angle of [0, 90, 180, 270]) {
          let start_node = this.get_node_from_position(
            new_x,
            new_y,
            coin_angle
          );
          let { distances } = findShortestPathDistances(
            this.graph.graph,
            start_node
          );
          this.update_distance_values(distances);
        }
      }
    }
  }
  /**
   * Object requires `real_bottom_left` and `angle`
   *
   */
  shortest_distance_from_obj(obj) {
    let { angle, real_bottom_left } = obj;
    let [i, j] = real_bottom_left;
    let node = this.get_node_from_position(i, j, angle);
    return this.distances[node];
  }
  update_values_from_grid_binary_board(grid, bot_id, bot_index = 0) {
    let crashing_board = grid.binary_crashing_board(bot_id, bot_index);
    // console.log(crashing_board);
    //Now we need to make edges from false -> false
    const isValidPosition = (i, j) =>
      0 <= i &&
      i < grid.cols &&
      0 <= j &&
      j < grid.rows &&
      !crashing_board[j][i];
    for (let j = 0; j < grid.rows; j++) {
      for (let i = 0; i < grid.cols; i++) {
        for (let angle of [0, 90, 180, 270]) {
          if (!isValidPosition(i, j)) {
            continue;
          }
          // console.log("Checking node...")
          let start_node = this.get_node_from_position(i, j, angle);
          // console.log(`checking start_node ${start_node}`)
          //Three possible moves: Keep moving, turn 90 right, or turn 90 left
          let start_bot = {
            angle: angle,
            real_bottom_left: [i, j],
          };
          let possible_moves = [
            {
              info: ["move", 1],
              weight: 1,
              end_position: this.future_position_after_move(start_bot, 1),
            },
            {
              info: ["turn", 90],
              weight: 1,
              end_position: this.future_position_after_turn(start_bot, 90),
            },
            {
              info: ["turn", -90],
              weight: 1,
              end_position: this.future_position_after_turn(start_bot, -90),
            },
          ];
          for (let { info, weight, end_position } of possible_moves) {
            let [end_i, end_j] = end_position.real_bottom_left;
            let end_angle = end_position.angle;
            if (!isValidPosition(end_i, end_j)) {
              continue;
            }
            let end_node = this.get_node_from_position(end_i, end_j, end_angle);
            // console.log(`Adding end_node ${end_node}`)
            this.graph.addDirectedEdge(start_node, end_node, weight, info);
          }
        }
      }
    }
  }
  future_position_after_move(prev_bot, distance) {
    let { angle, real_bottom_left } = prev_bot;
    let dx, dy;
    switch (angle) {
      case ANGLE_DIRS.RIGHT:
        dx = distance;
        dy = 0;
        break;
      case ANGLE_DIRS.LEFT:
        dx = -distance;
        dy = 0;
        break;
      case ANGLE_DIRS.UP:
        dx = 0;
        dy = distance;
        break;
      case ANGLE_DIRS.DOWN:
        dx = 0;
        dy = -distance;
        break;
      default:
        console.log(`Incorrect ANGLE : ${angle}`);
    }
    //TODO: Check for out-of-board cases
    let new_bottom_left = [real_bottom_left[0] + dx, real_bottom_left[1] + dy];
    return { angle, real_bottom_left: new_bottom_left };
  }
  future_position_after_turn(prev_bot, angle) {
    let new_angle = (prev_bot.angle + angle) % 360;
    if (new_angle < 0) {
      new_angle += 360;
    }

    return { real_bottom_left: prev_bot.real_bottom_left, angle: new_angle };
  }
  update_values_from_grid(grid, bot_id, bot_index = 0) {
    let binary_board = grid.binary_board(bot_id, bot_index);
    let bot = grid.bots[bot_id][bot_index];
    let { width, height } = bot;
    // console.log(`grid rows = ${grid.rows} and columns = ${grid.cols}`);
    for (let i = 0; i < grid.cols; i++) {
      for (let j = 0; j < grid.rows; j++) {
        for (let angle of [0, 90, 180, 270]) {
          let start_bot = { ...bot, angle: angle, real_bottom_left: [i, j] }; //node
          //This is possible because the is_valid_bot_position only checks for the id to ignore crashes
          let { valid } = grid.is_valid_bot_position({ ...start_bot });
          if (!valid) {
            continue;
          }
          let start_node = this.get_node_from_position(i, j, angle);
          let end_bots = [
            {
              info: ["move", 1],
              weight: 1,
              end_bot: grid.future_position_after_move({ ...start_bot }, 1),
            },
            {
              info: ["turn", 90],
              weight: 0,
              end_bot: grid.future_position_after_turn({ ...start_bot }, 90),
            },
            {
              info: ["turn", 180],
              weight: 0,
              end_bot: grid.future_position_after_turn({ ...start_bot }, 180),
            },
            {
              info: ["turn", 270],
              weight: 0,
              end_bot: grid.future_position_after_turn({ ...start_bot }, 270),
            },
          ];
          for (let { info, weight, end_bot } of end_bots) {
            if (!end_bot.valid_position) {
              continue;
            }
            let [end_i, end_j] = end_bot.real_bottom_left;
            let end_angle = end_bot.angle;
            let end_node = this.get_node_from_position(end_i, end_j, end_angle);
            this.graph.addEdge(start_node, end_node, weight, info);
          }
        }
      }
    }
  }
  /**
   * @param {Object} bot
   * @param {Object} obj
   */
  shortest_path(bot, obj) {
    let start_node = this.get_node_from_position(
      bot.real_bottom_left[0],
      bot.real_bottom_left[1],
      bot.angle
    );
    let [obj_x, obj_y] = obj.real_bottom_left;
    let obj_width = obj.width;
    let obj_height = obj.height;
    let w = bot.width;
    let h = bot.height;
    let min_distance = null;
    let min_response = {
      distance: null,
      path_nodes: null,
      path_edges: null,
    };

    let min_bot_x = Math.max(0, obj_x - w + 1);
    let max_bot_x = Math.min(grid.cols - w, obj_x + obj_width - 1);
    let min_bot_y = Math.max(0, obj_y - h + 1);
    let max_bot_y = Math.min(grid.rows - h, obj_y + obj_height - 1);
    for (let new_x = min_bot_x; new_x <= max_bot_x; new_x++) {
      for (let new_y = min_bot_y; new_y <= max_bot_y; new_y++) {
        let end_node = this.get_node_from_position(new_x, new_y, 0);
        let distance_info = this.graph.shortestPath(start_node, end_node);
        if (distance_info.distance === null) {
          //Not reachable
          continue;
        }
        if (min_distance === null || distance_info.distance < min_distance) {
          min_distance = distance_info.distance;
          min_response = distance_info;
        }
      }
    }
    return min_response;
  }
  is_reachable_from(bot, obj) {
    //TODO: Shouldn't need to calculate the minimum to do this
    return this.shortest_path(bot, obj).distance !== null;
  }
}
