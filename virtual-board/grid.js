const BOT_TYPE = "bot";
const OBSTACLE_TYPE = "obstacle";
const COIN_TYPE = "coin";
//Angles are counterclowsie with respect to the x-axis
const ANGLE_DIRS = {
    RIGHT: 0,
    UP: 90,
    LEFT: 180,
    DOWN: 270
}
const MIN_BOT_ID = 1;
const MIN_OBSTACLE_ID = 11;
const MIN_COIN_ID = 21;
const MIN_OTHER_ID = 31;

const BOT_POLICIES = {
    RANDOM: {
        value: "random",
        text: "Random"
    },
    GET_CLOSER: {
        value: "Get closer",
        text: "Get closer"
    },
    GET_FARTHER: {
        value: "Get farther",
        text: "Get farther"
    },
    GET_COINS: {
        value: "Get coins",
        text: "Get coins"
    }
}

const DISTANCE_VALUES = {
    EUCLIDEAN: {
        value: "Euclidean",
        text: "Euclidean"
    },
    MANHATTAN: {
        value: "Manhattan",
        text: "Manhattan"
    }
}
class VirtualGrid{
    constructor(m, n, drawBoard, bots=[], obstacles=[], coins=[]){
        this.rows = m;
        this.cols = n;
        for (let bot of bots){
            this.add_bot(bot);
        }
        for (let obstacle of obstacles){
            this.add_obstacle(obstacle);
        }
        for (let coin of coins){
            this.add_coin(coin);
        }       
        // 0 <= i < this.cols && 0 <= j < this.rows where (0, 0) is the bottom-left of the grid
        // id -> {id_index: {id, id_index, real_bottom_left: (i, j), relative_anchor: (di, dj), width: w, height: h, type}}
        // If the relative_anchor is (0,0) that means tha 
        this.bots = {}; //bots should have an {angle} that the bot is looking at (e.g., 0 is looking right)
        this.obstacles = {};
        this.coins = {};
        this.drawBoard = drawBoard;
        this.graphs = {} // bot_id => Reachability graph
    }
    get_bot_angle(bot_id, bot_index=0){
        let bot = this.bots[bot_id][bot_index];
        return bot.angle;
    }
    /**
     * It returns the correct object 
     * 
     * @param {*} obj 
     * @param {*} type 
     * @returns 
     */
    add_object(obj, type){
        if (!("id" in obj)){
            console.log("Error! Object should have an id parameter");
            return;
        }
        let potential_crashes = this.get_almost_crashes({...obj, type}, 0);
        // console.log("adding objects");
        // console.log({...obj, type})
        // console.log(potential_crashes);
        if (BOT_TYPE in potential_crashes || OBSTACLE_TYPE in potential_crashes || COIN_TYPE in potential_crashes){
            return {success: false, message: `Error adding object with type ${type}: There is a crash`}
        }
        if (!this.isInsideBoard(obj.real_bottom_left, obj.width, obj.height)){
            return {success: false, message: `Error adding object with type ${type}: Outside bounds`}
        }
        let {id, width, height} = obj;
        if (width <= 0 || height <= 0){
            return {success: false, message: `Error adding object with type ${type}: Width and height have to be positive`}
        }
        //make sure this has the 
        let objects = type === BOT_TYPE ? this.bots : 
                     type === COIN_TYPE ? this.coins : 
                     type === OBSTACLE_TYPE ? this.obstacles : null;
        if (objects === null){
            console.log(`oops, trying to add an object with an invalid type: ${type}`);
            return {success: false, message: `Error adding object with type ${type}: Invalid type`}
        }
        if (!(id in objects)){objects[id] = {}};
        //Get index bigger than everyone else
        let id_index = Math.max(-1, ...Object.keys(objects[id])) + 1; 
        let newObject = {...obj, type, id_index};
        if (type === BOT_TYPE){
            newObject = {
                ...newObject, 
                coins: [], 
                policies: new Set(), 
                distance_type: DISTANCE_VALUES.EUCLIDEAN.value, //default distance, should be first in 'select' UI
                only_reachable: false, //Whether to only calculate distance to reachable points
                targets:[]
            };
        }
        objects[id][id_index] = newObject;
        // objects[id].push(newObject);
        this.drawBoard(this.print_board());
        return {success: true, message: `Succesfully added object with type ${type} and id ${id}`, object: newObject}
    }
    /**
     * 
     * @param {*} future_bot 
     * @param {*} look_ahead 
     * @returns an Object representing all bosts, obstacles and coins this would crash into
     */
    get_almost_crashes(future_bot, look_ahead=1){
        // console.log("Getting almost crashes for")
        // console.log(future_bot);
        //Check for almost-crashes with obstacles
        let almost_crashes = {};

        //Check for almost-crashes with other bots
        for (let newBot_id in this.bots){
            newBot_id = Number(newBot_id);
            for(let [newBot_index, newBot] of Object.entries(this.bots[newBot_id])){
                newBot_index = Number(newBot_index);
                // if (future_bot.type === BOT_TYPE && future_bot.id === newBot_id && newBot.id_index === newBot_index){
                // TODO: Put the check back if have multiple bots with same id
                if (future_bot.type === BOT_TYPE && future_bot.id === newBot_id){
                    //Dont count crashes with itself
                    continue;
                }
                if (this.almost_crash(future_bot, newBot, look_ahead)){
                    if (!(BOT_TYPE in almost_crashes)){
                        almost_crashes[BOT_TYPE] = [];
                    }
                    almost_crashes[BOT_TYPE].push([newBot_id, newBot_index, BOT_TYPE])
                }
            }
        }

        for (let obstacle_id in this.obstacles){
            obstacle_id = Number(obstacle_id)
            for(let [obstacle_index, obstacle] of Object.entries(this.obstacles[obstacle_id])){
                obstacle_index = Number(obstacle_index);
                if (this.almost_crash(future_bot, obstacle, look_ahead)){
                    if (!(OBSTACLE_TYPE in almost_crashes)){
                        almost_crashes[OBSTACLE_TYPE] = [];
                    }
                    almost_crashes[OBSTACLE_TYPE].push([obstacle_id, obstacle_index, OBSTACLE_TYPE])
                }
            }
        }
        //Check for almost crashes with coins
        for (let coin_id in this.coins){
            coin_id = Number(coin_id)
            for(let [coin_index, coin] of Object.entries(this.coins[coin_id])){
                coin_index = Number(coin_index);
                if (this.almost_crash(future_bot, coin, look_ahead)){
                    if (!(COIN_TYPE in almost_crashes)){
                        almost_crashes[COIN_TYPE] = [];
                    }
                    almost_crashes[COIN_TYPE].push([coin_id, coin_index, COIN_TYPE])
                }
            }
        }
        // console.log("Ouput: almost_crashes");
        // console.log(almost_crashes);
        return almost_crashes;

    }
    /**
     * 
     * @param {*} bottom_left 
     * @param {*} width 
     * @param {*} height 
     * @returns true if the block at bottm_left with [width, height] is fully inside the board 
     */
    isInsideBoard(bottom_left, width, height){
        let [minBotX, minBotY] = bottom_left;
        let [maxBotX, maxBotY] = [minBotX + width - 1, minBotY + height - 1];

        return 0 <= minBotX && maxBotX <= this.cols -1 && 0 <= minBotY && maxBotY <= this.rows -1;
    }
    getNewBotId(){
        //TODO: Make sure there are not too many bots
        let max_bot_id = Math.max(MIN_BOT_ID-1, ...Object.keys(this.bots));
        return max_bot_id + 1;
    }
    getNewObstacleId(){
        //Make sure there are not too many obstacles
        let max_obstacle_id = Math.max(MIN_OBSTACLE_ID-1, ...Object.keys(this.obstacles));
        return max_obstacle_id + 1;
    }
    getNewCoinId(){
        let max_coin_id = Math.max(MIN_COIN_ID-1, ...Object.keys(this.coins));
        return max_coin_id + 1;
    }
    add_random_coin(){
        let MAX_ATTEMPTS = 10;
        let attempt = 0;
        while (attempt < MAX_ATTEMPTS){
            attempt++;
            let col = Math.floor(Math.random() * this.cols);
            let row = Math.floor(Math.random() * this.rows);
            let coinId = this.getNewCoinId();
            let potential_coin =  {
                id: coinId,
                real_bottom_left: [col,row],
                width: 1,
                height: 1,
            }
            let result = this.add_coin(potential_coin);
            if (result.success){
                //Just add it once!
                return result;
            }
        }
    }
    //min = inclusive, max = exclusive
    random_number_between(min, max){
        return min + Math.floor(Math.random() * max-min);
    }
    random_from(arr){
        return arr[this.random_number_between(0, arr.length)]
    }
    /**
     * For now hardcodes it as a 3x3 with a central pivot. It randomly chooses 
     * a (valid) position and angle.
     * @returns 
     */
    add_random_bot(){
        let MAX_ATTEMPTS = 10;
        let attempt = 0;
        while(attempt < MAX_ATTEMPTS){
            attempt++;
            let col = this.random_number_between(0, this.cols); //Math.floor(Math.random() * this.cols);
            let row = this.random_number_between(0, this.rows); //Math.floor(Math.random() * this.rows);
            let botId = this.getNewBotId();
            //For now hardcode it
            let [width, height] = [3, 3];
            let relative_anchor = [1, 1];
            let angle = this.random_from(Object.values(ANGLE_DIRS));
            let potential_bot =  {
                id: botId,
                real_bottom_left: [col,row],
                width: width,
                height: height,
                relative_anchor: relative_anchor,
                angle: angle,
            }
            let result = this.add_bot(potential_bot);
            if (result.success){
                //Just add it once!
                return result;
            }
        }
    }
    add_random_obstacle(){
        let MAX_ATTEMPTS = 10;
        let attempt = 0;
        while (attempt < MAX_ATTEMPTS){
            let col = this.random_number_between(0, this.cols); //Math.floor(Math.random() * this.cols);
            let row = this.random_number_between(0, this.rows); //Math.floor(Math.random() * this.rows);
            let possible_sizes = [
                [1, 2],
                [1, 3],
                [2, 1],
                [3, 1],
                [2, 2],
            ]
            let [width, height] = this.random_from(possible_sizes);
            let obstacleId = this.getNewObstacleId();
            let potential_obstacle =  {
                id: obstacleId,
                real_bottom_left: [col,row],
                width: width,
                height: height,
            }
            let result = this.add_obstacle(potential_obstacle);
            if (result.success){
                //Just add it once!
                return result;
            }
        }
    }
    /**
     * If there are no obstacles, adds a random one. If there is at least one, 
     * removes it and then adds a random one.
     */
    add_or_change_obstacle(){
        console.log(this.obstacles);
        console.log(Object.keys(this.obstacles))
        if (Object.keys(this.obstacles).length > 0){
            //delete an obstacle
            let obstacle_id = Math.min(...Object.keys(this.obstacles));
            console.log(`About to delete obstacle ${obstacle_id}`)
            this.remove_obstacle(obstacle_id, 0);
        }
        this.add_random_obstacle();
    }
    /**
     * 
     * @param {*} bot_id 
     * @param {*} distance 
     * @param {*} bot_index 
     * @returns where the bot would end up + 'valid_position' which is true or false;
     */
    future_position_after_move(prev_bot, distance){
        let {angle, real_bottom_left} = prev_bot;
        let dx, dy;
        switch(angle){
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
                console.log(`Incorrect ANGLE : ${angle}`)
        }
        //TODO: Check for out-of-board cases
        let new_bottom_left = [real_bottom_left[0]+dx, real_bottom_left[1]+dy];

        let future_bot = {...prev_bot, real_bottom_left: new_bottom_left}
        let valid_position = this.is_valid_bot_position(future_bot).valid;
        let future_crashes = this.get_almost_crashes(future_bot, 0)
        return {...future_bot, valid_position: valid_position, future_crashes: future_crashes}
    }
    /**
     * 
     * @param {*} future_bot
     * Checks that it's inside the board, and that it doesnt crash with other bots or obstacles 
     */
    is_valid_bot_position(future_bot){
        // console.log(`Checking if the bot is valid:`);
        // console.log(future_bot);
        let new_bottom_left = future_bot.real_bottom_left;
        if (!this.isInsideBoard(new_bottom_left, future_bot.width, future_bot.height)){
            //TODO: Apply a policy here (i.e., change direction)
            // console.log("It's not, it'd be outside the board!")
            return {valid: false, message: "Cant move because it'd go outside the board"}
        }
        let potential_crashes = this.get_almost_crashes({...future_bot, type: BOT_TYPE}, 0);
        // console.log("potential_crashes:");
        // console.log(potential_crashes)
        if (BOT_TYPE in potential_crashes || OBSTACLE_TYPE in potential_crashes){
            //Error, should not allow crashes with other bots or obstacles
            //TODO: Apply a policy here (i.e., change direction)
            // console.log("It's not, it's crash with other bots/obstacles!")
            return {valid: false, message:"Found potential crash with a bot or an obstacle"}
        }
        // console.log("It's valid!")
        return {valid: true, message: "Valid bot position!"};
    }
    /**
     * Walks in the current direction the bot is looking at
     * 
     * @param {*} bot_id 
     * @param {*} distance a number
     * @param {*} bot_index the index of which bot with a given idis this referring to. If all ids are different this should be 0
     * @param {*} is_fake If true, this would only return the expected response but only after making a deep copy of it, so no actual changes
     */
    move_bot(bot_id, distance, bot_index=0, is_fake = false){
        // console.log("moving bot!")
        let bot = this.bots[bot_id][bot_index]
        let future_bot = this.future_position_after_move(bot, distance);
        let new_bottom_left = future_bot.real_bottom_left;
        //TODO: Why this if almost_crashes will be defined later
        let potential_crashes = this.get_almost_crashes({...future_bot,type: BOT_TYPE}, 0);

        let valid_position_response = this.is_valid_bot_position(future_bot);
        if (!valid_position_response.valid){
            return {bot: bot, ...valid_position_response, success: valid_position_response.valid};
        }

        let coinsPicked = [];
        if (COIN_TYPE in potential_crashes){
            //If crashed with coins then pick them up
            for (let [coin_id, coin_index, _] of potential_crashes[COIN_TYPE]){
                //TODO: Change bot state (e.g., give it more points)
                this.remove_coin(coin_id, coin_index);
                bot.coins.push([coin_id, coin_index])
                coinsPicked.push([coin_id, coin_index]);
            }
        }
        let almost_crashes = this.get_almost_crashes({...future_bot, type: BOT_TYPE})
        bot.almost_crashes = almost_crashes;
        console.log(`Updating position of bot ${bot_id} from ${bot.real_bottom_left} to ${new_bottom_left}`)
        bot.real_bottom_left = new_bottom_left;
        //Below might not be necessary because Javascript send objects by reference, not by copy
        this.bots[bot_id][bot_index] = bot;
        let message = coinsPicked.length === 0 ? "": `Moved succesfully and picked up ${coinsPicked.length} coins ${coinsPicked}`
        this.drawBoard(this.print_board());

        //Now that the bot has moved, we can add stuff
        for (let _ of coinsPicked){
            //If crashed with coins then pick them up
            //TODO: Change bot state (e.g., give it more points)
            this.add_random_coin(); //TODO: just for fun
            this.add_or_change_obstacle(); //TODO: just for fun
        }
        return {success: true, bot: bot, message: message};
    }
    /**
     * 
     * @param {*} bot_id 
     * @param {*} new_anchor ABSOLUTE position (i.e., with respect to the board)
     * @param {*} needToAdd whether to add new policy or remove it
     * @param {*} bot_index 
     */
    update_bot(bot_id, update, bot_index=0){
        let {new_anchor, new_angle} = update;

        //TODO: This function does not take into considerations crashes
        let bot = this.bots[bot_id][bot_index];

        if (new_anchor){
            let [x, y] = bot.real_bottom_left;
            let [anchor_x, anchor_y] = bot.relative_anchor;
            let dx =  new_anchor[0] - (x + anchor_x);
            let dy =  new_anchor[1] - (y + anchor_y);
            bot.real_bottom_left = [x+dx, y+dy];
        }
        if (new_angle){
            bot.angle = new_angle;
        }
        let message = `Moved succesfully`;
        return {success: true, bot: bot, message: message};
    }
    /**
     * policy_key should be a valid key of BOT_POLICIES
     */
    update_bot_policy(bot_id, policy_key, needToAdd, bot_index=0){
        console.log(`Trying to update policy ${policy_key} for id ${bot_id} [${needToAdd}]`);
        let bot = this.bots[bot_id][bot_index];
        if (!(Object.keys(BOT_POLICIES).includes(policy_key))){
            console.log(`Incorrect new_policy : ${policy_key}. Only valid policies are ${Object.keys(BOT_POLICIES)}`)
            return;
        }
        let policy_value = BOT_POLICIES[policy_key].value;
        if (needToAdd){
            bot.policies.add(policy_value);
        } else{
            bot.policies.delete(policy_value);
        }
        console.log(`Updated bot ${bot_id} and now new policies are ${Array.from(bot.policies)}`);
        // this.bots[bot_id][bot_index] = bot;
    }
    update_bot_distance(bot_id, distance_value, bot_index=0){
        let bot = this.bots[bot_id][bot_index];
        bot.distance_type = distance_value;
    }
    /**
     * Either moves the bot forward, backward or turns 90 degrees 
     * @param {*} bot_id 
     * @param {*} bot_index 
     */
    move_bot_randomly(bot_id, bot_index=0){
        let NUM_MOVES = 3;
        let randomMove = Math.floor(Math.random() * NUM_MOVES);

        switch (randomMove){
            case 0:
                return this.move_bot(bot_id, 1, bot_index)
            case 1:
                return this.move_bot(bot_id, -1, bot_index)
            case 2:
                return this.turn_bot(bot_id, 90);
            default:
                console.log(`Invalid randomMove = ${randomMove}`);
        }
    }
    get_object_center(obj){
        //If bot, calculate position in terms of the anchor
        // Otherwise, calculate position as the center
        let object_position;
        let {real_bottom_left} = obj;
        if (obj.type === BOT_TYPE){
            let {relative_anchor} = obj;
            object_position = [real_bottom_left[0] + relative_anchor[0], real_bottom_left[1] + relative_anchor[1]];
        } else {
            let {width, height} = obj;
            object_position = [real_bottom_left[0] + width/2, real_bottom_left[1] + height/2];
        }
        return object_position;
    }
    /**
     * Distance between 2D coordinates, according to a given distance
     * @param {*} obj1 
     * @param {*} obj2 
     * @param {*} distance_type 
     * @returns 
     */
    distance_according_policy(obj1, obj2, distance_type){
        let dx = obj1[0] - obj2[0];
        let dy = obj1[1] - obj2[1];
        switch (distance_type){
            case DISTANCE_VALUES.EUCLIDEAN.value:
                return Math.sqrt(dx*dx+dy*dy)
            case DISTANCE_VALUES.MANHATTAN.value:
                return Math.abs(dx) + Math.abs(dy);
            default:
                console.log(`Unkown distance_type: ${distance_type}`);
        }
    }
    /**
     * 
     * @param {*} board_position 
     * @param {*} bot_id 
     * @param {*} bot_index 
     * @returns 2D distance between bot and board position, according to bot's selected distance type
     */
    distance_to_object(future_bot, obj, bot_index=0){
        let object_position = this.get_object_center(obj);
        // TODO: Use another distance function? Maybe Euclidean?
        // Make this part of the policy??
        let future_position = this.get_object_center(future_bot);
        // let future_position = [
        //     future_bot.real_bottom_left[0] + future_bot.relative_anchor[0],
        //     future_bot.real_bottom_left[1] + future_bot.relative_anchor[1]
        // ]
        //Not reading from future_bot because it might not get the distance information, but only parts of it
        let {distance_type} = this.bots[future_bot.id][bot_index];
        let result =  this.distance_according_policy(future_position, object_position, distance_type);
        console.log(`Calculated distance = ${result}`)
        return result;
    }
    /**
     * 
     * @param {*} future_bot
     * @param {*} bots array of bot ids
     * @returns Sum of distances (in board coordinates) to all given bots.
     */
    distance_to_bots(future_bot, bots){
        console.log(`Calculating distances to bots: ${bots}`);
        console.log("Starting:");
        console.log(future_bot)
        let res = 0;
        for (let bot_id of bots){
            console.log(this.bots[bot_id])
            for (let bot_index in this.bots[bot_id]){
                let bot_obj = this.bots[bot_id][bot_index];
                res += this.distance_to_object(future_bot, bot_obj);
            }
        }
        return res;
    }
    /**
     * Returns whether the bot can get to the given object, by taking into consideration other bots 
     * and other obstacles
     * @param {*} future_bot 
     * @param {*} obj 
     * @returns 
     */
    is_reachable_from(future_bot, obj){
        //Not the most efficient way. TODO: Try the "bleed" method
        // return this.graphs[future_bot.id].is_reachable_from(future_bot, obj);
        let binary_crashing_board = this.binary_crashing_board(future_bot.id);
        let reachable_board = this.reachable_board(binary_crashing_board, future_bot.real_bottom_left); 
        //Check if any the bot can move to pick any part of the object
        let [x1, y1, x2, y2]= this.get_crashing_bounds(future_bot, obj); 
        const getValueAtPosition = (pos) => reachable_board[pos[1]][pos[0]];
        const isReachable = (pos) => {
            //should be a number
            let val = getValueAtPosition(pos);
            return val !== true && val !== false;
        }
        for (let i = x1; i <= x2; i++){
            for (let j = y1; j <= y2; j++){
                if (isReachable([i, j])){
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * @param {*} future_bot 
     * @returns the minimum distance from the bot to all the coins
     */
    min_distance_to_coins(future_bot){
        let res = null;
        for (let coin_id in this.coins){
            for (let coin_index in this.coins[coin_id]){
                let coin_obj = this.coins[coin_id][coin_index];
                // if it's reachable (or if it doesnt matter), consider this coin
                if (!future_bot.only_reachable || this.is_reachable_from(future_bot, coin_obj)){
                    if (res === null){
                        res = this.distance_to_object(future_bot, coin_obj);
                    } else {
                        res = Math.min(res, this.distance_to_object(future_bot, coin_obj));
                        // res = Math.min(res, distance_response.distance);
                    }
                }
            }
        }
        return res;
    }
    /*
        Moves the bot to whichever direction keeps them the closest
        to the other bots
    */
    move_bot_closer_or_farther(bot_id, bot_index=0, is_closer){
        if (is_closer){
            console.log("------------------------CLOSER-------------------------------------")
        } else{
            console.log("------------------------FARTHER-------------------------------------")
        }
        let bot = this.bots[bot_id][bot_index];
        //TODO: Get this bots from bot.targets array
        let other_bots = Object.keys(this.bots).filter(other_bot_id => other_bot_id!== bot_id);
        let extreme_distance = is_closer ? Number.MAX_SAFE_INTEGER: -Number.MAX_SAFE_INTEGER;
        // let extreme_distance_move = null;
        //Gonna go through all turns (and moving 1 on that direction)
        let extreme_directions = [];
        for (let direction in ANGLE_DIRS) {
            let turn_angle = ANGLE_DIRS[direction];
            console.log(`Trying angle ${turn_angle} for bot ${bot_id}`);
            let future_bot = this.future_position_after_turn(bot, turn_angle)
            console.log(`Future bot after turning ${turn_angle} is`);
            console.log(future_bot)
            if (!future_bot.valid_position){
                console.log("skipping")
                continue;
            }
            future_bot = this.future_position_after_move(future_bot, 1);
            console.log(`Future bot after turning ${turn_angle} and moving 1 is`);
            console.log(future_bot)
            if (!future_bot.valid_position){
                console.log("skipping again")
                continue;
            }
            let distance = this.distance_to_bots(future_bot, other_bots);
            console.log(`Future distance = ${distance}`);

            if (distance === extreme_distance){
                extreme_directions.push(direction);
            } else {
                if (is_closer === (distance < extreme_distance)){
                    console.log(`Found new extreme_distance = ${distance} with diection = ${direction}`);
                    extreme_distance = distance;
                    // extreme_distance_move = direction;
                    extreme_directions = [direction];
                }
            }
        }   
        // If there was a tie, pick one direction at random
        let extreme_distance_move = this.random_from(extreme_directions);
        console.log(`[Move bot closer] Moved bot ${bot_id} ${extreme_distance} deg`);
        //Now that we know which direction to move, we can move the bot for real
        let response_turn = this.turn_bot(bot_id, ANGLE_DIRS[extreme_distance_move], bot_index);
        if (!response_turn.success){
            //If not successful, just return what happened
            return response_turn;
        }
        let response_move = this.move_bot(bot_id, 1, bot_index);

        return response_move;
    }
    /**
     * 
     * @param {*} num_turns 
     * @returns Array of possible moves, each of the form of ['RIGHT', 'UP', 'RIGHT']
     */
    get_multiple_turns(num_turns){
        if (num_turns < 1){
            return [];
        }
        if (num_turns === 1){
            return Object.keys(ANGLE_DIRS).map(direction => [direction]);
        }
        let prev = this.get_multiple_turns(num_turns-1);
        let res = []
        for (let direction in ANGLE_DIRS){
            for (let move of prev){
                res.push([...move, direction])
            }
        }
        return res;
    }
    /**
     * Returns the position a bot would be after a certain amount of turns (and moving in that direction). If at any point it 
     * makes an invalid position, it will just continue to the next one. Additionally, it adds a `valid_move`
     * field which is true iff at least one movement was valid.
     * 
     * @param {*} initial_bot 
     * @param {*} directions of the form ['RIGHT', 'UP', 'RIGHT']
     * 
     */
    future_position_after_turns(initial_bot, directions){
        let future_bot = {...initial_bot};
        let valid_move = false;
        for (let direction of directions){
            let turn_angle = ANGLE_DIRS[direction];
            let potential_bot = this.future_position_after_turn(future_bot, turn_angle)
            if (!potential_bot.valid_position){
                continue;
            }
            potential_bot = this.future_position_after_move(potential_bot, 1);
            if (!potential_bot.valid_position){
                continue;
            }
            valid_move = true;
            delete potential_bot.valid_position;
            //Succesful move, update bot
            future_bot = {...potential_bot};
        }
        return {...future_bot, valid_move};
    }
    /**
     * As with any move, returns a LIST of {bot: , success: } object. Success is defined if at least 
     * one of the turn and move were succesful
     * 
     * @param {*} bot_id 
     * @param {*} bot_index 
     * @param {*} turns 
     * @returns 
     */
    move_bot_multiple_turns(bot_id, bot_index, turns){
        console.log(`Update with multiple turns: ${turns}`)
        let bot = this.bots[bot_id][bot_index];
        let success = false;
        let history = [];
        for (let direction of turns){
            let response_turn = this.turn_bot(bot_id, ANGLE_DIRS[direction], bot_index);
            if (!response_turn.success){
                continue;
            }
            let response_move = this.move_bot(bot_id, 1, bot_index);
            if (!response_move.success){
                continue;
            }
            success = true;
            history.push({...response_move, bot: {...response_move.bot}, board: this.print_board()}); //TODO: Do deepCopy
        }
        return history;
    }
    /**
     *
     * @param {*} bot_id 
     * @param {*} bot_index 
     * @param {*} look_ahead How many steps to perform
     * @returns 
     */
    move_bot_using_get_coins(bot_id, bot_index=0, num_moves=1){

        let bot = this.bots[bot_id][bot_index];
        //Only relevant if we want to know whether coins are reachable
        let min_distance = Number.MAX_SAFE_INTEGER;
        let directions = [];
        let list_of_turns = this.get_multiple_turns(num_moves);
        for (let turns of list_of_turns){
            let future_bot = this.future_position_after_turns(bot, turns);
            if (!future_bot.valid_move){
                //didnt move at all, dont take into consideration
                continue;
            }
            let distance;
            if (future_bot.future_crashes[COIN_TYPE]){
                //While moving it potentially will crash with a coin, that's good!
                distance = 0;
            } else {
                distance = this.min_distance_to_coins(future_bot);
                if (distance === null){
                    //No coin is within reach
                    continue;
                }
            }
            if (distance === min_distance){
                directions.push(turns);
            } else if (distance < min_distance){
                min_distance = distance;
                directions = [turns];
            }
        }
        if (directions.length === 0){
            //If no position let to a reachable place
            return {
                bot: bot,
                success: false,
                message: "No moves leaves coin within reach"
            }
        }
        //If there was a tie, pick randomly
        let chosen_turns = this.random_from(directions);
        console.log(`Chosen = ${chosen_turns} with distance ${min_distance}`)
        //IMPORTANT Only move the first step!
        chosen_turns = [chosen_turns[0]] 
        return this.move_bot_multiple_turns(bot_id, bot_index, chosen_turns);
    }
    /**
     * 
     * @param {} bot_id 
     * @param {*} bot_index 
     * @returns a LIST of [ object with at least {bot: updated_bot} field ]. If it only moved once then the list would have 
     * length 1
     */
    move_bot_using_policies(bot_id, bot_index=0, num_turns){
        let bot = this.bots[bot_id][bot_index];
        if (bot.policies.has(BOT_POLICIES.GET_COINS.value)){
            //Only do this if there are coins to move to
            if (Object.keys(this.coins).length !== 0){
                return this.move_bot_using_get_coins(bot_id, bot_index, num_turns);
            }
        }
        
        if (bot.policies.has(BOT_POLICIES.GET_FARTHER.value)){
            return this.move_bot_closer_or_farther(bot_id, bot_index, false);
        } else if (bot.policies.has(BOT_POLICIES.GET_CLOSER.value)){
            // Default is to move rand
            return this.move_bot_closer_or_farther(bot_id, bot_index, true);
        } else if (bot.policies.has(BOT_POLICIES.RANDOM.value)){
            return this.move_bot_randomly(bot_id, bot_index);
        } else {
            return {bot: bot}
        }
    }
    update_obstacle(obstacle_id, update, obstacle_index=0){
        let {new_anchor} = update;

        //TODO: This function does not take into considerations crashes
        let obstacle = this.obstacles[obstacle_id][obstacle_index];

        if (new_anchor){
            let [x, y] = obstacle.real_bottom_left;
            let [anchor_x, anchor_y] = obstacle.relative_anchor;
            let dx =  new_anchor[0] - (x + anchor_x);
            let dy =  new_anchor[1] - (y + anchor_y);
            obstacle.real_bottom_left = [x+dx, y+dy];
        }
        let message = `Moved succesfully`;
        return {success: true, obstacle: obstacle, message: message};
    }
    update_coin(coin_id, update, coin_index=0){
        let {new_anchor} = update;

        //TODO: This function does not take into considerations crashes
        let coin = this.coins[coin_id][coin_index];

        if (new_anchor){
            let [x, y] = coin.real_bottom_left;
            let [anchor_x, anchor_y] = coin.relative_anchor;
            let dx =  new_anchor[0] - (x + anchor_x);
            let dy =  new_anchor[1] - (y + anchor_y);
            coin.real_bottom_left = [x+dx, y+dy];
        }
        let message = `Moved succesfully`;
        return {success: true, coin: coin, message: message};
    }
    update_only_reachable(bot_id, only_reachable, bot_index = 0){
        this.bots[bot_id][bot_index].only_reachable = only_reachable;
    }
    /**
     * 
     * @param {*} bot 
     * @param {*} obstacle 
     * @param {*} look_ahead 
     * @returns true iff the bot after `look_ahead` steps and the obstacle are crashing 
     */
    almost_crash(bot, obstacle, look_ahead){
        let obs_pos = obstacle.real_bottom_left;
        let dx = 0;
        let dy = 0;
        if (bot.type !== BOT_TYPE  && look_ahead !== 0){
            console.log(`Careful, the only movable objects should be bots... but got ${bot.type}`)
        }
        if (bot.type === BOT_TYPE){
            switch(bot.angle){
                case ANGLE_DIRS.RIGHT:
                    dx = look_ahead;
                    dy = 0;
                    break;
                case ANGLE_DIRS.LEFT:
                    dx = -look_ahead;
                    dy = 0;
                    break;
                case ANGLE_DIRS.UP:
                    dx = 0;
                    dy = look_ahead;
                    break;
                case ANGLE_DIRS.DOWN:
                    dx = 0;
                    dy = -look_ahead;
                    break;
                default:
                    console.log(`Incorrect ANGLE : ${bot.angle}`)
            }
        }
        // console.log("look ahead:")
        // console.log(look_ahead);
        // console.log([dx, dy]);
        let [minObsX, minObsY] = [obs_pos[0], obs_pos[1]];
        let [maxObsX, maxObsY] = [minObsX + obstacle.width - 1, minObsY + obstacle.height - 1];
        
        let [minBotX, minBotY] = [bot.real_bottom_left[0] + dx, bot.real_bottom_left[1] + dy];
        let [maxBotX, maxBotY] = [minBotX + bot.width - 1, minBotY + bot.height - 1];

        //Now return true iff the two overlap
        let overlapX = !(minBotX > maxObsX || minObsX > maxBotX);
        let overlapY = !(minBotY > maxObsY || minObsY > maxBotY);
        return overlapX && overlapY;

    }
    /**
     * 
     * @param {*} prev_bot 
     * @param {*} bot_index 
     * @returns the position of the bot, if it turned 90 deg counterclockwise
     */
    future_position_after_90_turn(prev_bot){
        let {angle, real_bottom_left, relative_anchor, width, height} = prev_bot;
        //Update values as necessary
        // switch(angle){
        //     case (ANGLE_DIRS.RIGHT):
        //         break;
        //     case (ANGLE_DIRS.UP):
        //         relative_anchor = 
        //         break;
        //     case (ANGLE_DIRS.LEFT):
        //         break;
        //     case (ANGLE_DIRS.DOWN):
        //         break;
        //     default:
        // }
        let [i, j] = relative_anchor;
        let real_anchor = [real_bottom_left[0] + relative_anchor[0], real_bottom_left[1]+ relative_anchor[1]];
        // console.log(`real_anchor: ${real_anchor}`)
        relative_anchor = [height-j-1, i]; //new anchor
        // console.log(`new_real_anchor: ${relative_anchor}`)
        real_bottom_left = [real_anchor[0]-relative_anchor[0],real_anchor[1]-relative_anchor[1]]; //so that real_anchor stays the same, since we are turning over the anchor
        // console.log(`real_bottom_left: ${real_bottom_left}`)
        //Turning 90 always changes dimensions
        [width, height] = [height, width];
        angle = ( angle + 90 ) % 360;

        //Need to keep id info from the bot
        let future_bot = {...prev_bot, angle, real_bottom_left, relative_anchor, width, height};
        let valid_position = this.is_valid_bot_position(future_bot).valid;
        let future_crashes = this.get_almost_crashes(future_bot, 0)
        return {...future_bot, valid_position, future_crashes: future_crashes};
    }
    future_position_after_turn(prev_bot, turn_angle){
        //cast the angle to 0, 360
        turn_angle = turn_angle % 360;
        if (turn_angle < 0){
            turn_angle += 360;
        }
        let valid_position = true;
        let future_crashes = [];
        for (let i = 0; i < turn_angle; i+=90){
            prev_bot = this.future_position_after_90_turn(prev_bot);
            let temp_valid = this.is_valid_bot_position(prev_bot).valid;
            if (!temp_valid){
                valid_position = false;
            } else {
                future_crashes = [...future_crashes, prev_bot.future_crashes]
            }
        }
        return {...prev_bot, valid_position: valid_position, future_crashes: future_crashes};
    }
    /**
     * Turn 90 deg counterclockwise. Updates global object
     * @param {*} bot_id 
     * @param {*} bot_index 
     */
    turn_90(bot_id, bot_index=0){
        let bot = this.bots[bot_id][bot_index];
        let future_bot = this.future_position_after_90_turn(bot);
        let {angle, real_bottom_left, relative_anchor, width, height} = future_bot;

        //Save new values
        bot.real_bottom_left = real_bottom_left;
        bot.relative_anchor = relative_anchor;
        bot.width = width;
        bot.height = height;
        bot.angle = angle;


        //Check for almost-cross
        let almost_crashes = this.get_almost_crashes({...future_bot, type: BOT_TYPE})

        bot.almost_crashes = almost_crashes;

        return bot;
    }
    /**
     * Returns bot and success
     * 
     * @param {*} bot_id 
     * @param {*} angle in counterclowise
     * @param {*} bot_index 
     */
    turn_bot(bot_id, angle, bot_index=0){
        let bot;
        //Making sure angle is on [0. 360)
        if (angle >= 0){
            angle = angle % 360;
        } else{
            angle = 360 - ((-angle) % 360);
        }
        //Turning 90deg multiple times
        for (let i = 0; i * 90 < angle; i+=1){
            //TODO: Maybe don't update global object, yet
            bot = this.turn_90(bot_id, bot_index);
        }
        // console.log(`bot after turning ${angle}`)
        // console.log(bot);
        this.drawBoard(this.print_board());
        // TODO: Under assumption of square bots, turning should always be fine
        // But might be better to check for other cases.
        return {bot, success: true, message:`Bot with id ${bot_id} turned ${angle} degrees`};
    }
    /**
     * 
     * @param {*} bot Object with id, bottom_left, width, height
     */
    add_bot(bot){
        let result = this.add_object(bot, BOT_TYPE);
        if (!result.success){
            return result;
        } else {
            let bot = result.object;
            delete result.object;
            result.bot = bot;
            return result;
        }
    }
    remove_bot(bot_id, bot_index=0){
        delete this.bots[bot_id][bot_index];
        // this.obstacles[obstacle_id].splice(obstacle_index, 1);

        if (Object.keys(this.bots[bot_id]).length === 0){
            delete this.bots[bot_id];
        }
    }
    add_obstacle(obstacle){
        let result = this.add_object(obstacle, OBSTACLE_TYPE);
        if (!result.success){
            return result;
        } else{
            let obstacle = result.object;
            delete result.object;
            result.obstacle = obstacle;
            return result;
        }
    }
    remove_obstacle(obstacle_id, obstacle_index=0){
        delete this.obstacles[obstacle_id][obstacle_index];
        // this.obstacles[obstacle_id].splice(obstacle_index, 1);

        if (Object.keys(this.obstacles[obstacle_id]).length === 0){
            delete this.obstacles[obstacle_id];
        }
    }
    add_coin(coin){
        let result = this.add_object(coin, COIN_TYPE);
        if (!result.success){
            return result;
        } else{
            let coin = result.object;
            delete result.object;
            result.coin = coin;
            return result;
        }
    }
    remove_coin(coin_id, coin_index=0){
        delete this.coins[coin_id][coin_index];
        // this.obstacles[obstacle_id].splice(obstacle_index, 1);

        if (Object.keys(this.coins[coin_id]).length === 0){
            delete this.coins[coin_id];
        }
    }
    /**
     * Quite slow, use only for testing
     */
    print_board(){
        let board = [];
        for (let j = 0; j < this.rows; j++){
            let row = [];
            for (let i = 0; i < this.cols; i++){
                row.push("");
            }
            board.push(row);
        }

        //Adding bots
        for (let bot_id in this.bots){
            for (let [bot_index, bot] of Object.entries(this.bots[bot_id])){
                //Adding all values in the bot
                let [a, b] = bot.real_bottom_left;
                // let name = `bot-${bot_id}-${bot_index}`;
                let name = `${BOT_TYPE}-${bot_id}`;
                let [i_anchor, j_anchor] = bot.relative_anchor;
                for (let i = 0; i < bot.width; i++){
                    for (let j = 0; j < bot.height; j++){
                        if ( 0 <= b + j && b+j < this.rows && 0 <= a + i && a+i < this.cols){
                            let isAnchor = (i === i_anchor && j === j_anchor);
                            let isRightEdge = i === bot.width -1;
                            let isLeftEdge = i === 0;
                            let isUpEdge = j === bot.height -1;
                            let isDownEdge = j === 0;

                            let isMovingEdge = (bot.angle === ANGLE_DIRS.RIGHT && isRightEdge) || 
                                                (bot.angle === ANGLE_DIRS.LEFT && isLeftEdge) || 
                                                (bot.angle === ANGLE_DIRS.UP && isUpEdge) || 
                                                (bot.angle === ANGLE_DIRS.DOWN && isDownEdge);
                            let edgeName = `${BOT_TYPE}-edge-${bot_id}`;
                            let finalName =  isAnchor ? "X": 
                                             isMovingEdge ? edgeName: name;

                            board[b+j][a+i] = finalName;
                        }
                    }
                }
            }
        }

        //Adding obstacles
        for (let obstacle_id in this.obstacles){
            for (let [obstacle_index, obstacle] of Object.entries(this.obstacles[obstacle_id])){
                //Adding all values in the bot
                let [a, b] = obstacle.real_bottom_left;
                // let name = `obs-${obstacle_id}-${obstacle_index}`;
                let name = `${OBSTACLE_TYPE}-${obstacle_id}`;
                for (let i = 0; i < obstacle.width; i++){
                    for (let j = 0; j < obstacle.height; j++){
                        if ( 0 <= b + j && b+j < this.rows && 0 <= a + i && a+i < this.cols){
                            board[b+j][a+i] = name;
                        }
                    }
                }
            }
        }
        //Adding coins
        for (let coin_id in this.coins){
            for (let [coin_index, coin] of Object.entries(this.coins[coin_id])){
                //Adding all values in the bot
                let [a, b] = coin.real_bottom_left;
                // let name = `obs-${coin_id}-${coin_index}`;
                let name = `${COIN_TYPE}-${coin_id}`;
                for (let i = 0; i < coin.width; i++){
                    for (let j = 0; j < coin.height; j++){
                        if ( 0 <= b + j && b+j < this.rows && 0 <= a + i && a+i < this.cols){
                            board[b+j][a+i] = name;
                        }
                    }
                }
            }
        }
        // console.log("Current state of board: ");
        // console.log("Current state of board: ");
        //Finally, print everything!
        //Starting from last to 0 so that it appears correctly
        for (let j = this.rows-1; j >= 0; j--){
            let row = `Row ${j}: `;
            for (let i = 0; i < this.cols; i++){
                row += (" | " + board[j][i]);
            }
            // console.log(row);
        }

        return board;
    }
    /**
     * Adding obstacles and bots to true, except with the given bot
     */
    binary_board(bot_id, bot_index=0){
        let board = [];
        for (let j = 0; j < this.rows; j++){
            let row = [];
            for (let i = 0; i < this.cols; i++){
                row.push(false);
            }
            board.push(row);
        }
        let all_objects = Object.assign({}, this.bots, this.obstacles);

        //Adding bots
        for (let obj_id in all_objects){
            for (let [obj_index, obj] of Object.entries(all_objects[obj_id])){
                if (bot_id === obj_id && bot_index === obj_index){
                    continue;
                }
                //Setting everything covered by 
                let [a, b] = obj.real_bottom_left;
                for (let i = 0; i < obj.width; i++){
                    for (let j = 0; j < obj.height; j++){
                        if ( 0 <= b + j && b+j < this.rows && 0 <= a + i && a+i < this.cols){
                            board[b+j][a+i] = true;
                        }
                    }
                }
            }
        }
        return board;
    }
    //Returns [x1, y1, x2, y2]
    //which means that any bot in that range
    //will crash with the object
    get_crashing_bounds(bot, obj){
        let [obj_x, obj_y] = obj.real_bottom_left;
        let obj_width = obj.width;
        let obj_height = obj.height;
        let w = bot.width;
        let h = bot.height;

        let min_bot_x = Math.max(0, obj_x-w+1);
        let max_bot_x = Math.min(grid.cols-w, obj_x+obj_width-1);
        let min_bot_y = Math.max(0, obj_y-h+1);
        let max_bot_y = Math.min(grid.rows-h, obj_y+obj_height-1);
        return [min_bot_x, min_bot_y, max_bot_x, max_bot_y]
    }
    /**
     * Binary board, where a cell is true iff the real_bottom_left of the
     * given bot *will* crash with any other bot or obstacle
     */
    binary_crashing_board(bot_id, bot_index=0){
        let bot = this.bots[bot_id][bot_index];
        let numRows = this.rows - bot.width + 1;
        let numCols = this.cols - bot.height + 1;
        let crashing_board = [];
        for (let j = 0; j < numRows; j++){
            let row = [];
            for (let i = 0; i < numCols; i++){
                row.push(false);
            }
            crashing_board.push(row);
        }
        let all_objects = Object.assign({}, this.bots, this.obstacles);

        //Adding objects
        for (let obj_id in all_objects){
            obj_id = Number(obj_id)
            for (let [obj_index, obj] of Object.entries(all_objects[obj_id])){
                obj_index = Number(obj_index)
                // console.log(`Checking ${obj_id} (${typeof obj_id})/${obj_index} (${typeof obj_index})`)
                // console.log(`Against ${bot_id} (${typeof bot_id})/${bot_index} (${typeof bot_index})`)
                if (bot_id === obj_id && bot_index === obj_index){
                    // console.log("skipping")
                    continue;
                }
                let [min_bot_x, min_bot_y, max_bot_x, max_bot_y] = this.get_crashing_bounds(bot, obj);
                for (let i = min_bot_x; i <= max_bot_x; i++){
                    for (let j = min_bot_y; j <= max_bot_y; j++){
                        crashing_board[j][i] = true;
                    }
                }
                // //Setting everything covered by 
                // let [a, b] = obj.real_bottom_left;
                // for (let i = 0; i < obj.width; i++){
                //     for (let j = 0; j < obj.height; j++){
                //         if ( 0 <= b + j && b+j < this.rows && 0 <= a + i && a+i < this.cols){
                //             board[b+j][a+i] = true;
                //         }
                //     }
                // }
            }
        }
        return crashing_board;
    }
    /**   
    Performs BFS. This does `not` take into consideration rotation as a movement. It assumes
    you can freely go from one place to the other and rotatins has a weight of 0. Might need to change later.

    returns a board where every value is either:
        true, if it cannot be reached because otherwise it would crash with an obstacle
        false, if it cannot be reached because its not reachable
        an integer representing the shortest length to get to that place 
    */
    reachable_board(crashing_board, initial_position){
        crashing_board = [...crashing_board];

        let [start_x, start_y] = initial_position;
        const getValueAtPosition = (pos) => crashing_board[pos[1]][pos[0]];
        const isInsidePosition = (pos) => 0 <= pos[0] && pos[0] < crashing_board[0].length && 0 <= pos[1] && pos[1] < crashing_board.length;
        const setValueAtPosition = (pos, val) => {
            crashing_board[pos[1]][pos[0]] = val;
        }
        if (!isInsidePosition(initial_position)){
            console.log("The starting coordinates is not valid");
            console.log(initial_position)
            return crashing_board;
        }
        setValueAtPosition(initial_position, 0);
        let positions = [initial_position]
        let movements = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        while (positions.length > 0){
            let new_positions = []
            for (let position of positions){
                for (let [dx, dy] of movements){
                    let new_position = [position[0]+dx, position[1]+dy];
                    if (!isInsidePosition(new_position)){
                        continue;
                    }
                    let prev = getValueAtPosition(new_position);
                    // Only consider the ones that have not been visited
                    if (prev === false){
                        //1 step extra because of move
                        setValueAtPosition(new_position, getValueAtPosition(position) + 1);
                        new_positions.push(new_position);
                    } 

                }
            }
            positions = new_positions;
        }
        return crashing_board;
    }
}