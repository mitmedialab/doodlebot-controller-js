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
        return findShortestPath(this.graph, start, end);
    }
}
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
        return
    }
    get_position_from_node(node){
        return
    }
    update_values_from_grid(grid, bot_id, bot_index=0){
        let binary_board = grid.binary_board(bot_id, bot_index);
        let bot = grid.bots[bot_id][bot_index];
        let {width, height} = bot;
        for (let i = 0; i < grid.rows; i++){
            for (let j = 0; j < grid.cols; j++){
                for (let angle of [0, 90, 180, 270]){
                    let start_bot = {...bot, angle: angle, real_bottom_left: [i, j]}; //node
                    //This is possible because the is_valid_bot_position only checks for the id to ignore crashes
                    let {valid} = grid.is_valid_bot_position(start_bot);
                    if (!valid){
                        continue;
                    }
                    let start_node = this.get_node_from_position(i, j, angle);
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
}