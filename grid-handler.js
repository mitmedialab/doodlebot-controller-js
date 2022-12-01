let grid;

let [rows, cols] = [8, 8];

function log(message) {
  logDiv.value = message + "\n" + logDiv.value;
}
function drawBoard(){
    if (!grid){
        log(`Couldnt draw board because there is no grid available!`);
        return;
    }
    let board = grid.print_board();
    let gridDiv = document.getElementById("gridDiv");
    gridDiv.innerHTML = ""; //Erase everything before. TODO: Too innefficient, just update the ones you need to

    let rows = board.length;
    let cols = board[0].length;
    let colNumbersDiv = document.createElement('div');
    colNumbersDiv.classList.add('row')
    let empty = document.createElement('div');
    empty.classList.add('cell-column-text');
    colNumbersDiv.appendChild(empty);
    for (let i = rows-1; i >=0; i-- ){
        let row = document.createElement('div');
        row.classList.add("row");

        rowNumberDiv = document.createElement('div');
        rowNumberDiv.classList.add("cell-row-text")
        rowNumberDiv.innerHTML = `Row ${i}`;
        row.appendChild(rowNumberDiv);
        for (let j = 0; j < cols; j++){
            let cell = document.createElement('div');
            cell.classList.add('column')
            let text = board[i][j];
            cell.innerText = text;
            if (text.startsWith(BOT_TYPE)){
                if (text.startsWith(`${BOT_TYPE}-edge`)){
                    cell.classList.add("cell-bot-edge")
                } else{
                    cell.classList.add("cell-bot")
                }
            } else if (text.startsWith(OBSTACLE_TYPE)){
                cell.classList.add("cell-obstacle")
            } else if (text.startsWith(COIN_TYPE)){
                cell.classList.add("cell-coin")
            }
            row.appendChild(cell);

            if (i === 0){
                let colDiv = document.createElement('div');
                colDiv.classList.add("cell-column-text");
                colDiv.innerHTML = `Col ${j}`
                colNumbersDiv.appendChild(colDiv);
            }
        }
        gridDiv.appendChild(row);
    }
    gridDiv.appendChild(colNumbersDiv)

    // console.log(ANGLE_DIRS);
    const angle_to_text = (angle) => {
        angle = Number(angle)
        // console.log(`Angle = ${angle}`)
        switch(angle){
            case ANGLE_DIRS.DOWN: return "down"
            case ANGLE_DIRS.LEFT: return "left"
            case ANGLE_DIRS.UP: return "up"
            case ANGLE_DIRS.RIGHT: return "right"
        }
    }
    let text = "\n";
    let coinText = '\n';
    for (let [bot_id, bots] of Object.entries(grid.bots)){
        let bot = bots[0] //TODO: Change his for all indices
        text += `Bot #${bot_id}: ${angle_to_text(bot.angle)} \n`;
        coinText += `Bot #${bot_id}: ${bot.coins.length} coin(s) \n`
    }
    botDirectionsDiv.innerText = text;
    botScoresDiv.value = coinText;
}
let all_bot_ids = [];
let min_bot_id = 1;
let all_obstacle_ids = [];
let min_obstacle_id = 11;

let all_coin_ids = [];
let min_coin_id = 21;

create_grid_button.addEventListener("click", (evt)=>{
    grid = new VirtualGrid(rows, cols);
    drawBoard();
})

addBotButton.addEventListener("click", (evt)=>{
    console.log("Create bot")
    let new_bot_id = grid.getNewBotId();
    console.log(new_bot_id)
    let bot = {
        id: new_bot_id, 
        real_bottom_left: [0, 0],
        relative_anchor: [2, 2],
        width: 5,
        height: 5,
        angle: 0, //Right
    }
    let {success, message} = grid.add_bot(bot);
    if (!success){
        log(message);
        return;
    }
    all_bot_ids.push(new_bot_id);
    console.log(grid.bots)
    console.log({...grid.bots[new_bot_id][0]})
    drawBoard();

    //Add it to options
    let option = document.createElement('option');
    option.setAttribute('value', new_bot_id);
    option.setAttribute('label', `id ${new_bot_id}`);
    botSelect.appendChild(option);
})
addObstacleButton.addEventListener("click", (evt)=>{
    let obstacleId = grid.getNewObstacleId();
    let row = Number(obstacleRowNumberInput.value);
    let col = Number(obstacleColNumberInput.value);
    let width = Number(obstacleWidthInput.value);
    let height = Number(obstacleColNumber.value);
    console.log(obstacleId);
    console.log(row);
    console.log(col);
    console.log(width);
    console.log(height);    
    let obstacle = {
        id: obstacleId,
        real_bottom_left: [col,row],
        width: width,
        height: height,
    }
    let {success, message} = grid.add_obstacle(obstacle);
    if (!success){
        log(message);
        return;
    }
    all_obstacle_ids.push(obstacleId);

    drawBoard();
})
addCoinButton.addEventListener("click", (evt)=>{
    let coinId = grid.getNewCoinId();
    let row = Number(coinRowNumberInput.value);
    let col = Number(coinColNumberInput.value);
    let width = Number(coinWidthInput.value);
    let height = Number(coinColNumber.value);  
    let coin = {
        id: coinId,
        real_bottom_left: [col,row],
        width: width,
        height: height,
    }
    let {success, message} = grid.add_coin(coin);
    if (!success){
        log(message);
        return;
    }
    all_coin_ids.push(coinId);

    drawBoard();
})
function updateCrashes(bot){
    // console.log(bot.almost_crashes);
    let text = `Info for bot #${bot.id} \n`;
    if (Object.keys(bot.almost_crashes).length === 0){
        text += "No crashes to be expected!"
    } else{
        for (let [object_type, object_crashes] of Object.entries(bot.almost_crashes)){
            for (let [object_id, object_index, _] of object_crashes){
                text += `Potential crash with ${object_type}:  ${object_id} \n`;
            }
        }
    }
    botCrashLog.value = text;
}
function moveBot(bot_id, distance){
    // console.log("move 1");
    let {success, bot, message} = grid.move_bot(bot_id, distance);
    if (!success){
        // log(`Problem with moving ${bot.id}:`)
        log(message);
        return;
    } else{
        //Dont print empty messages
        if (message){
            log(message);
        }
    }
    updateCrashes(bot);
    drawBoard();
}
function turnBot90(bot_id){
    console.log("Turning 90")
    let bot = grid.turn_bot(bot_id, 90);
    updateCrashes(bot);
    drawBoard();
}
moveButton.addEventListener("click", (evt)=>{
    let bot_id = botSelect.value;
    moveBot(bot_id, 1);
})
moveBackwardsButton.addEventListener("click", (evt)=>{
    let bot_id = botSelect.value;
    moveBot(bot_id, -1);
})
turn90Button.addEventListener("click", (evt)=>{
    let bot_id = botSelect.value;
    turnBot90(bot_id);
})

let movingRandomly = false;
let intervals = {};
generateRandomMovesButton.addEventListener("click", (evt)=>{
    // 0 -> Move forward
    // 1 -> Move backward
    // 2 -> Turn 90
    // movingRandomly = true;
    let NUM_MOVES = 3;
    let bot_id = botSelect.value;
    if (bot_id in intervals){
        log('The bot is already moving!');
    }
    function move(){
        let randomMove = Math.floor(Math.random() * NUM_MOVES);

        switch (randomMove){
            case 0:
                moveBot(bot_id, 1);
                break;
            case 1:
                moveBot(bot_id, -1);
                break;
            case 2:
                turnBot90(bot_id);
                break;
            default:
                console.log(`Invalid randomMove = ${randomMove}`);
        }
    }
    intervals[bot_id] = setInterval(move, 500);
})

stopButton.addEventListener("click", (evt)=>{
    let bot_id = botSelect.value;
    clearInterval(intervals[bot_id]);
    delete intervals[bot_id];
})