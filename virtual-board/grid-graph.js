/**
 * Abstract representation of a directed-weighted graph
 */
class Graph{
    constructor(){
        this.graph = {}
    }
    /**
     * Adds a node to a graph, in case it doesnt exist yet
     * @param {String} node 
     */
    addNode(node){
        if (!Object.keys(this.graph).includes(node)){
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
    addDirectedEdge(start, end, weight, info = {}){
        this.addNode(start);
        this.addNode(end);
        this.graph[start][end] = {weight, info};
    }
    /**
     * Adds both edges from start to end and end with start
     * 
     * @param {String} start 
     * @param {String} end 
     * @param {Number} weight 
     * @param {Object} info 
     */
    addEdge(start, end, weight, info={}){
        this.addDirectedEdge(start, end, weight, info);
        this.addDirectedEdge(end, start, weight, info);
    }
    /**
     * 
     * @param {string} start 
     * @param {string} end 
     */
    shortestPath(start, end){
        console.log(`Finding shortest path from ${start} to ${end}`);
        return findShortestPath(this.graph, start, end);
    }
}

function interpolate(breakpoints, values){
    if (breakpoints.length !== values.length){
        console.log(`The breakpoints should have a length (${breakpoints.length}) the same as the values input (${values.length})`)
    }
    let res = "";
    for (let i = 0; i < values.length; i++){
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
function getStringParts(string, breakpoints){
  let output = [];
  for (let i = 0; i < breakpoints.length; i++) {
    // console.log(`Trying to find match for ${breakpoints[i]}`);
    let index = string.indexOf(breakpoints[i]);
    if (index === -1){
      return null;
    }
    let startResponse = index + breakpoints[i].length;
    if (i === breakpoints.length - 1) {
      part = string.slice(startResponse, string.length);
    } else{
      let nextIndex = string.indexOf(breakpoints[i+1], startResponse);
      if (nextIndex === -1){
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
const NODE_BREAKPOINTS = ["i-", "j-", "angle-"];
/**
 * Representation of the graph related with a given grid from a bot's point of view. Anything different than the bot
 * is considered an "obstacle", meaning that one can't pass through that.
*/
class GridGraph{
    /**
     * 
     * @param {*} graph 
     */
    constructor(grid, bot_id, bot_index=0){
        this.graph = new Graph();
        this.update_values_from_grid(grid, bot_id, bot_index);
    }
    get_node_from_position(i, j, angle){
        return interpolate(NODE_BREAKPOINTS, [i, j, angle]);
    }
    get_position_from_node(node){
        return getStringParts(node, NODE_BREAKPOINTS).map(Number);
    }
    update_values_from_grid(grid, bot_id, bot_index=0){
        let binary_board = grid.binary_board(bot_id, bot_index);
        let bot = grid.bots[bot_id][bot_index];
        let {width, height} = bot;
        console.log(`grid rows = ${grid.rows} and columns = ${grid.cols}`);
        for (let i = 0; i < grid.rows; i++){
            for (let j = 0; j < grid.cols; j++){
                for (let angle of [0, 90, 180, 270]){
                    let start_bot = {...bot, angle: angle, real_bottom_left: [i, j]}; //node
                    //This is possible because the is_valid_bot_position only checks for the id to ignore crashes
                    let {valid} = grid.is_valid_bot_position(start_bot);
                    // if (!valid){
                    //     continue;
                    // }
                    let start_node = this.get_node_from_position(i, j, angle);
                    this.graph.addNode(start_node);
                    let end_bots = [
                        {info: ['move', 1], weight: 1, end_bot: grid.future_position_after_move(start_bot, 1)},
                        {info: ['turn', 90], weight: 0, end_bot: grid.future_position_after_turn(start_bot, 90)},
                        {info: ['turn', 180], weight: 0, end_bot: grid.future_position_after_turn(start_bot, 180)},
                        {info: ['turn', 270], weight: 0, end_bot: grid.future_position_after_turn(start_bot, 270)},
                    ];
                    for (let {info, weight, end_bot} of end_bots){
                        if (!grid.is_valid_bot_position(end_bot)){
                            continue;
                        }
                        let [end_i, end_j] = end_bot.real_bottom_left;
                        let end_angle = end_bot.angle;
                        let end_node = this.get_node_from_position(end_i, end_j, end_angle)
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
    shortest_path(bot, obj){
        let start_node = this.get_node_from_position(bot.real_bottom_left[0],bot.real_bottom_left[1], bot.angle);
        let [x, y] = obj.real_bottom_left;
        let min_distance = null;
        let min_response = null;
        for (let dx = 0; dx < obj.width; dx++){
            for (let dy = 0; dy < obj.height; dy++){
                let end_node = this.get_node_from_position(x + dx, y + dy, 0);
                let distance_info = this.graph.shortestPath(start_node, end_node);
                if (distance_info.distance === null){
                    //Not reachable
                    continue;
                }
                if (min_distance === null || distance_info.distance < min_distance){
                    min_distance = distance_info.distance;
                    min_response = distance_info;
                }
            }
        }
        if (min_distance === null){
            return null;
        } else {
            return min_response;
        }

    }
}