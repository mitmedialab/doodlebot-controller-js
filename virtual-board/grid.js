const BOT_TYPE = "bot";
const OBSTACLE_TYPE = "obstacle";

//Angles are counterclowsie with respect to the x-axis
const ANGLE_DIRS = {
    RIGHT: 0,
    UP: 90,
    LEFT: 180,
    DOWN: 270
}
class VirtualGrid{
    constructor(m, n, bots=[], obstacles=[]){
        this.rows = m;
        this.cols = n;
        for (let bot of bots){
            this.add_bot(bot);
        }
        for (let obstacle of obstacles){
            this.add_obstacle(obstacle);
        }
        // id -> [{id, real_bottom_left: (i, j), relative_anchor: (di, dj), width: w, height: h, type}]
        // If the relative_anchor is (0,0) that means tha 
        this.bots = {}; //bots should have an {angle} that the bot is looking at (e.g., 0 is looking right)
        this.obstacles = {};
    }
    add_object(obj, type){
        if (!("id" in obj)){
            console.log("Error! Object should have an id parameter");
            return;
        }
        let {id} = obj;
        let objects = type === BOT_TYPE ? this.bots : this.obstacles;

        if (!(id in objects)){objects[id] = []};
        let newObject = {...obj, type: type};
        objects[id].push(newObject);
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
        //Check for almost-cross
        let almost_crashes = [];
        for (let obstacle_id in this.obstacles){
            for(let [obstacle_index, obstacle] of this.obstacles[obstacle_id].entries()){
                if (this.almost_crash({...bot, real_bottom_left: new_bottom_left}, obstacle)){
                    almost_crashes.push([obstacle_id, obstacle_index])
                }
            }
        }
        bot.almost_crashes = almost_crashes;
        bot.real_bottom_left = new_bottom_left;
        //Below might not be necessary because Javascript send objects by reference, not by copy
        // this.bots[bot_id][bot_index] = bot;

        return bot;
    }
    almost_crash(bot, obstacle){
        let obs_pos = obstacle.real_bottom_left;
        let dx, dy;
        switch(bot.angle){
            case ANGLE_DIRS.RIGHT:
                dx = 1;
                dy = 0;
                break;
            case ANGLE_DIRS.LEFT:
                dx = -1;
                dy = 0;
                break;
            case ANGLE_DIRS.UP:
                dx = 0;
                dy = 1;
                break;
            case ANGLE_DIRS.DOWN:
                dx = 0;
                dy = -1;
                break;
            default:
                console.log(`Incorrect ANGLE : ${angle}`)
        }
        //Adding a padding of 1 in all sides of obstacle
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
        let almost_crashes = [];
        for (let obstacle_id in this.obstacles){
            for(let [obstacle_index, obstacle] of this.obstacles[obstacle_id].entries()){
                if (this.almost_crash({...bot, real_bottom_left: real_bottom_left}, obstacle)){
                    almost_crashes.push([obstacle_id, obstacle_index])
                }
            }
        }
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
        this.add_object(bot, BOT_TYPE);
    }
    add_obstacle(obstacle){
        this.add_object(obstacle, OBSTACLE_TYPE);
    }
    remove_obstacle(obstacle_id, obstacle_index=0){
        this.obstacles[obstacle_id].splice(obstacle_index, 1);

        if (this.obstacles[obstacle_id].length === 0){
            delete this.obstacles.obstacle_id;
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
            for (let [bot_index, bot] of this.bots[bot_id].entries()){
                //Adding all values in the bot
                let [a, b] = bot.real_bottom_left;
                // let name = `bot-${bot_id}-${bot_index}`;
                let name = `bot-${bot_id}`;
                let [i_anchor, j_anchor] = bot.relative_anchor;
                for (let i = 0; i < bot.width; i++){
                    for (let j = 0; j < bot.height; j++){
                        if ( 0 <= b + j && b+j < this.rows && 0 <= a + i && a+i < this.cols){
                            let finalName = (i === i_anchor && j === j_anchor) ? "X": name;
                            board[b+j][a+i] = finalName;
                        }
                    }
                }
            }
        }

        //Adding obstacles
        for (let obstacle_id in this.obstacles){
            for (let [obstacle_index, obstacle] of this.obstacles[obstacle_id].entries()){
                //Adding all values in the bot
                let [a, b] = obstacle.real_bottom_left;
                // let name = `obs-${obstacle_id}-${obstacle_index}`;
                let name = `obs-${obstacle_id}`;
                for (let i = 0; i < obstacle.width; i++){
                    for (let j = 0; j < obstacle.height; j++){
                        if ( 0 <= b + j && b+j < this.rows && 0 <= a + i && a+i < this.cols){
                            board[b+j][a+i] = name;
                        }
                    }
                }
            }
        }
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