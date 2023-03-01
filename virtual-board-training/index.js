let grid;
let boardDrawing;
let rows = 10;
let cols = 20;  
let recordingSteps = false;
let serverUrl = "http://localhost:5000"
let historyMoves = [];
function sendDataToServer(){
    console.log("sending to server!")
    let toSend = {
        history: historyMoves
    }
    // console.log(JSON.stringify(toSend));
    fetch(`${serverUrl}/record`, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(toSend)
    }).then(()=>{
        resetHistoryMoves()
    });
}
function resetHistoryMoves(){
    console.log("resetting history")
    historyMoves = []
    historyMovesDiv.innerHTML = "";
}
resetHistoryButton.addEventListener("click", (evt)=>{
    resetHistoryMoves();
})
function pickupCoinHandler(bot, coin){
    console.log("Just picked up a coin!")
    if (recordingSteps){
        sendDataToServer();
        initializeRandomGrid();
    }
}
document.addEventListener('DOMContentLoaded', () => {
    grid = new VirtualGrid(rows, cols, {onPickupCoin: pickupCoinHandler});
    drawBoard();
})
function log(message) {
  logDiv.value = message + "\n" + logDiv.value;
}
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
function drawBoard(board){
    // console.log("drawing board...")
    if (!board){
        // console.log("Didint find one, so get board")
        board = grid.print_board();
    }
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
    // // Adding directions
    // console.log('a');
    // console.log(grid.bots)
    let coinText = '\n';
    for (let [bot_id, bots] of Object.entries(grid.bots)){
        // console.log(bots);
        let bot = bots[0] //TODO: Change his for all indices
        // console.log(angle_to_text(bot.angle))
        text += `Bot #${bot_id}: ${angle_to_text(bot.angle)} \n`;
        coinText += `Bot #${bot_id}: ${bot.coins.length} coin(s) \n`
    }
    botDirectionsDiv.innerText = text;
    botScoresDiv.value = coinText;
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
    // console.log("Turning 90")
    let {success, bot} = grid.turn_bot(bot_id, 90);
    updateCrashes(bot);
    drawBoard();
}
function recordStep(info){
    console.log("recording step...")
    let {type} = info;
    historyMovesDiv.innerHTML += " --- " + type;
    historyMoves.push(info)
}
/**
 * 
 * @param {*} bot_id 
 * @param {*} new_direction 
 * 
 * Will turn a bot to a new direction. If they are already in that direction, 
 * it will move it 1 unit.
 */
function turnOrMove(bot_id, new_direction){
    console.log("turning or moving...")
    let bot_index = 0;
    let bot = grid.bots[bot_id][bot_index]
    let angle = grid.get_bot_angle(bot_id);
    let diff = (new_direction - angle) % 360;
    if (diff < 0){ diff += 360; } //Make sure diff is non-negative
    if (diff === 0){
        // Recording what it looked like before, and the potential move
        if (recordingSteps){
            recordStep({
                type: ['move', 1],
                angle: bot.angle,
                position: bot.real_bottom_left,
                status: grid.binary_board(bot_id)
            })
        }
        //TODO: Check move was valid before adding to it
        moveBot(bot_id, 1);
    } else{

        if (recordingSteps){
            recordStep({
                type: ['turn', diff],
                position: grid.bots[bot_id][bot_index].real_bottom_left,
                status: grid.binary_board(bot_id)
            })
        }
        //TODO: Check move was valid before adding to it
        for (let i = 0; i < diff; i+=90){
            turnBot90(bot_id);
        }
    }
}
function create_bot_options(bot){
    let bot_id = bot.id;
    let div = document.createElement('div');
    div.classList.add("bot-options");
    div.setAttribute('id', `bot-options-${bot_id}`)
    let header = document.createElement('h1');
    header.innerText = `Bot ${bot_id}`;
    let controlsDiv = document.createElement('div');
    let manualText = document.createElement('h2');
    manualText.innerText = 'Manual controls';
    controlsDiv.appendChild(manualText);
    let moveUpButton = createButton(`moveUpButton-${bot_id}`, "⬆", [
        {
            key: "click",
            handler: (evt)=>{turnOrMove_ClickHandler(bot_id, ANGLE_DIRS.UP, evt)}
        }
    ]);
    let moveDownButton = createButton(`moveDownButton-${bot_id}`, "⬇", [
        {
            key: "click",
            handler: (evt)=>{turnOrMove_ClickHandler(bot_id, ANGLE_DIRS.DOWN, evt)}
        }
    ]);
    let moveLeftButton = createButton(`moveLeftButton-${bot_id}`, "⬅", [
        {
            key: "click",
            handler: (evt)=>{turnOrMove_ClickHandler(bot_id, ANGLE_DIRS.LEFT, evt)}
        }
    ]);
    let moveRightButton = createButton(`moveRightButton-${bot_id}`, "⮕", [
        {
            key: "click",
            handler: (evt)=>{turnOrMove_ClickHandler(bot_id, ANGLE_DIRS.RIGHT, evt)}
        }
    ]);
    // Use bot angle to determine who starts with the selected color
    switch (bot.angle){
        case ANGLE_DIRS.UP:
            moveUpButton.classList.add("move-button-selected"); //Because it's the default
            break;
        case ANGLE_DIRS.DOWN:
            moveDownButton.classList.add("move-button-selected");
            break;
        case ANGLE_DIRS.LEFT:
            moveLeftButton.classList.add("move-button-selected");
            break;
        case ANGLE_DIRS.RIGHT:
            moveRightButton.classList.add("move-button-selected");
            break;
    }
    controlsDiv.classList.add("bot-moving-controls")
    controlsDiv.appendChild(moveUpButton);
    let tempDiv = document.createElement('div');
    tempDiv.classList.add("left-header-right")
    tempDiv.appendChild(moveLeftButton);
    tempDiv.appendChild(header);
    tempDiv.appendChild(moveRightButton);
    controlsDiv.appendChild(tempDiv);
    controlsDiv.appendChild(moveDownButton);

    let changeMovingButton = createButton(`changeMovingButton-${bot_id}`, "Start moving", [
        {
            key: "click",
            handler: (evt)=>{changeMoving_ClickHandler(bot_id, evt)}
        }
    ]);
    changeMovingButton.classList.add("bot-moving-btn");
    changeMovingButton.classList.add("bot-start")

    div.appendChild(controlsDiv);
    botControlsContainer.appendChild(div);
}

/**
 * Below are the handlers for the options created to when every bot is created
 */
let movingRandomly = false;
let intervals = {};

function turnOrMove_ClickHandler(bot_id, new_direction, evt){
    turnOrMove(bot_id, new_direction);
    //Update which direction is chosen
    //TODO: Don't do this if the turn/move was not successful
    let button_ids = {
        [ANGLE_DIRS.UP]: `moveUpButton-${bot_id}`,
        [ANGLE_DIRS.DOWN]: `moveDownButton-${bot_id}`,
        [ANGLE_DIRS.LEFT]: `moveLeftButton-${bot_id}`,
        [ANGLE_DIRS.RIGHT]: `moveRightButton-${bot_id}`,
    }
    for (let direction in button_ids){
        direction = Number(direction);
        if (direction === new_direction){
            document.getElementById(button_ids[direction]).classList.add("move-button-selected");
        } else{
            document.getElementById(button_ids[direction]).classList.remove("move-button-selected");
        }
    }
    
}

function changeMoving_ClickHandler(bot_id, evt){
    let isMoving = bot_id in intervals;
    if (isMoving){
        //Stop
        stopMovingButton_ClickHandler(bot_id, evt);
        evt.target.innerHTML = "Start moving";
        evt.target.classList.remove("bot-stop");
        evt.target.classList.add("bot-start");
    } else {
        //Start
        startMovingButton_ClickHandler(bot_id, evt);
        evt.target.innerHTML = "Stop moving";
        evt.target.classList.remove("bot-start");
        evt.target.classList.add("bot-stop");
    }
}
function startMovingButton_ClickHandler(bot_id, evt){
    if (bot_id in intervals){
        log('The bot is already moving!');
        return;
    }
    function move(){
        console.log("-------------------------MOVING-------------------")
        let num_turns = Number(document.getElementById(`coins-policy-turns-${bot_id}`).value);
        let history = grid.move_bot_using_policies(bot_id, bot_index=0, num_turns=num_turns);
        drawBoard()
    }
    intervals[bot_id] = setInterval(move, 500);
}
function stopMovingButton_ClickHandler(bot_id, evt){
    clearInterval(intervals[bot_id]);
    delete intervals[bot_id];
}

function initializeRandomGrid(){
    console.log("initializing...")
    //Get rid of previous controls
    document.getElementById("botControlsContainer").innerHTML = ""
    resetHistoryMoves();
    grid = new VirtualGrid(rows, cols)
    let numObstacles = VirtualGrid.random_number_between(5, 10);
    for (let i = 0; i < numObstacles; i++){
        grid.add_random_obstacle();
    }
    let {bot} = grid.add_random_bot();
    create_bot_options(bot)

    grid.add_random_coin(); //Target of bot
    drawBoard();
}

initializeRandomGridButton.addEventListener("click", (evt)=>{
    initializeRandomGrid();
})
function setRecordingSteps(value){
    recordingSteps = value;
    let message = recordingSteps ? "Grabando":"No grabando";
    document.getElementById("recordingStatusDiv").innerHTML = message;
}
startRecordingStepsButton.addEventListener("click", (evt)=>{
    setRecordingSteps(!recordingSteps);
})