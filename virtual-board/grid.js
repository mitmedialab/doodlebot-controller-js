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
class VirtualGrid{
    constructor(m, n, bots=[], obstacles=[], coins=[]){
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
        // id -> {id_index: {id, id_index, real_bottom_left: (i, j), relative_anchor: (di, dj), width: w, height: h, type}}
        // If the relative_anchor is (0,0) that means tha 
        this.bots = {}; //bots should have an {angle} that the bot is looking at (e.g., 0 is looking right)
        this.obstacles = {};
        this.coins = {};
    }
    add_object(obj, type){
        if (!("id" in obj)){
            console.log("Error! Object should have an id parameter");
            return;
        }
        let potential_crashes = this.get_almost_crashes({...obj, type}, obj.real_bottom_left, 0);
        console.log("adding objects");
        console.log({...obj, type})
        console.log(potential_crashes);
        if (BOT_TYPE in potential_crashes || OBSTACLE_TYPE in potential_crashes || COIN_TYPE in potential_crashes){
            return {success: false, message: `Error adding object with type ${type}: There is a crash`}
        }
        if (!this.isInsideBoard(obj.real_bottom_left, obj.width, obj.height)){
            return {success: false, message: `Error adding object with type ${type}: Outside bounds`}
        }
        let {id} = obj;
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
            newObject = {...newObject, coins: []}
        }
        objects[id][id_index] = newObject;
        // objects[id].push(newObject);
        return {success: true, message: `Succesfully added object with type ${type} and id ${id}`}
    }
    get_almost_crashes(bot, new_position, look_ahead=1){
        //Check for almost-crashes with obstacles
        let almost_crashes = {};

        //Check for almost-crashes with other bots
        for (let newBot_id in this.bots){
            newBot_id = Number(newBot_id);
            for(let [newBot_index, newBot] of Object.entries(this.bots[newBot_id])){
                newBot_index = Number(newBot_index);
                if (bot.type === BOT_TYPE && bot.id === newBot_id && newBot.id_index === newBot_index){
                    //Dont count crashes with itself
                    continue;
                }
                if (this.almost_crash({...bot, real_bottom_left: new_position}, newBot, look_ahead)){
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
                if (this.almost_crash({...bot, real_bottom_left: new_position}, obstacle, look_ahead)){
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
                if (this.almost_crash({...bot, real_bottom_left: new_position}, coin, look_ahead)){
                    if (!(COIN_TYPE in almost_crashes)){
                        almost_crashes[COIN_TYPE] = [];
                    }
                    almost_crashes[COIN_TYPE].push([coin_id, coin_index, COIN_TYPE])
                }
            }
        }
        console.log("almost_crashes");
        console.log(almost_crashes);
        return almost_crashes;

    }
    isInsideBoard(bottom_left, width, height){
        let [minBotX, minBotY] = bottom_left;
        let [maxBotX, maxBotY] = [minBotX + width - 1, minBotY + height - 1];

        return 0 <= minBotX && maxBotX <= this.cols -1 && 0 <= minBotY && maxBotY <= this.rows -1;
    }
    /**
     * Walks in the current direction the bot is looking at
     * 
     * @param {*} bot_id 
     * @param {*} distance a number
     * @param {*} bot_index the index of which bot with a given idis this referring to. If all ids are different this should be 0
     */
    move_bot(bot_id, distance, bot_index=0){
        let bot = this.bots[bot_id][bot_index]

        let {angle, real_bottom_left} = bot;
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
        if (!this.isInsideBoard(new_bottom_left, bot.width, bot.height)){
            //TODO: Apply a policy here (i.e., change direction)
            return {success: false, bot: bot, message: "Cant move because it'd go outside the board"}
        }
        let potential_crashes = this.get_almost_crashes(bot, new_bottom_left, 0);
        console.log("potential_crashes");
        console.log(potential_crashes);
        if (BOT_TYPE in potential_crashes || OBSTACLE_TYPE in potential_crashes){
            //Error, should not allow crashes with other bots or obstacles
            //TODO: Apply a policy here (i.e., change direction)
            return {success: false, bot: bot, message:"Found potential crash with a bot or an obstacle"}
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

        let almost_crashes = this.get_almost_crashes(bot, new_bottom_left, 1)
        bot.almost_crashes = almost_crashes;
        bot.real_bottom_left = new_bottom_left;
        //Below might not be necessary because Javascript send objects by reference, not by copy
        // this.bots[bot_id][bot_index] = bot;
        let message = coinsPicked.length === 0 ? "": `Moved succesfully and picked up ${coinsPicked.length} coins ${coinsPicked}`
        return {success: true, bot: bot, message: message};
    }
    almost_crash(bot, obstacle, look_ahead){
        let obs_pos = obstacle.real_bottom_left;
        let dx = 0;
        let dy = 0;
        if (bot.type !== BOT_TYPE  && look_ahead !== 0){
            console.log("Careful, the only movable objects should be bots...")
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
        console.log("look ahead:")
        console.log(look_ahead);
        console.log([dx, dy]);
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
     * Turn 90 deg counterclockwise
     * @param {*} bot_id 
     * @param {*} bot_index 
     */
    turn_90(bot_id, bot_index=0){
        let bot = this.bots[bot_id][bot_index];
        let {angle, real_bottom_left, relative_anchor, width, height} = bot;
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
        console.log(`real_anchor: ${real_anchor}`)
        relative_anchor = [height-j-1, i]; //new anchor
        console.log(`new_real_anchor: ${relative_anchor}`)
        real_bottom_left = [real_anchor[0]-relative_anchor[0],real_anchor[1]-relative_anchor[1]]; //so that real_anchor stays the same, since we are turning over the anchor
        // console.log(`real_bottom_left: ${real_bottom_left}`)
        //Turning 90 always changes dimensions
        [width, height] = [height, width];
        angle = ( angle + 90 ) % 360;


        //Save new values
        bot.real_bottom_left = real_bottom_left;
        bot.relative_anchor = relative_anchor;
        bot.width = width;
        bot.height = height;
        bot.angle = angle;


        //Check for almost-cross
        let almost_crashes = this.get_almost_crashes(bot, real_bottom_left)

        bot.almost_crashes = almost_crashes;

        return bot;
    }
    /**
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
        return bot;
    }
    /**
     * 
     * @param {*} bot Object with id, bottom_left, width, height
     */
    add_bot(bot){
        return this.add_object(bot, BOT_TYPE);
    }
    add_obstacle(obstacle){
        return this.add_object(obstacle, OBSTACLE_TYPE);
    }
    remove_obstacle(obstacle_id, obstacle_index=0){
        delete this.obstacles[obstacle_id][obstacle_index];
        // this.obstacles[obstacle_id].splice(obstacle_index, 1);

        if (Object.keys(this.obstacles[obstacle_id]).length === 0){
            delete this.obstacles[obstacle_id];
        }
    }
    add_coin(coin){
        return this.add_object(coin, COIN_TYPE);
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
        for (let i = 0; i < this.rows; i++){
            let row = [];
            for (let j = 0; j < this.cols; j++){
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
        console.log("Current state of board: ");
        console.log("Current state of board: ");
        //Finally, print everything!
        //Starting from last to 0 so that it appears correctly
        for (let i = this.rows-1; i >= 0; i--){
            let row = `Row ${i}: `;
            for (let j = 0; j < this.cols; j++){
                row += (" | " + board[i][j]);
            }
            console.log(row);
        }

        return board;
    }
}