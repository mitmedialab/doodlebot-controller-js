let grid;

let [rows, cols] = [8, 8];

function log(message) {
  logDiv.value = message + "\n" + logDiv.value;
}
// aruco id -> {widthRight, widthLeft, heightTop, heightBottom, real_anchor}
let CURRENT_SIZES = {

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

// create_grid_button.addEventListener("click", (evt)=>{
//     grid = new VirtualGrid(rows, cols, {
//         onAddBot,
//         onAddObstacle: onAddObject,
//         onAddCoin: onAddObject
//     });
//     drawBoard();
// })

/**
 * 
 * @param {*} obj_id 
 * @param {*} type 
 * @param {*} deltas {dx: , dy: , d}
 * @param {*} evt 
 */
function updateObj_ClickHandler(obj_id, type, deltas, evt){
    if (positionState !== STATES.SETUP){
        if (positionState === STATES.RECORDING){
            alert("Can't update the info yet. Make sure you pressed 'Change State' button");
        } else {
            alert("You can't change the sizes now. Need to restart the process.")
        }
        return;
    }
    let defaultDeltas = {
        dWidthRight: 0,
        dWidthLeft: 0,
        dHeightUp: 0,
        dHeightDown: 0,
        dx: 0,
        dy: 0
    }
    deltas = Object.assign(defaultDeltas, deltas);
    let prevSize = {...CURRENT_SIZES[obj_id]}; //save how it was before in case the update didnt work
    CURRENT_SIZES[obj_id].widthRight += deltas.dWidthRight;
    CURRENT_SIZES[obj_id].widthLeft += deltas.dWidthLeft;
    CURRENT_SIZES[obj_id].heightUp += deltas.dHeightUp;
    CURRENT_SIZES[obj_id].heightDown += deltas.dHeightDown;
    let prev_real_anchor = CURRENT_SIZES[obj_id].real_anchor;
    console.log("prev_real_anchor");
    console.log(prev_real_anchor);
    CURRENT_SIZES[obj_id].real_anchor = [prev_real_anchor[0]+deltas.dx, prev_real_anchor[1]+deltas.dy];
    let {
        widthRight,
        widthLeft,
        heightUp,
        heightDown,
        real_anchor
    } = CURRENT_SIZES[obj_id];
    if (widthRight < 0 || widthLeft < 0 || heightUp < 0 || heightDown < 0){
        console.log(`None of the widthRight, widthLeft, heightUp, heightDown should be negative`);
        CURRENT_SIZES[obj_id] = prevSize;
        return;
    }
    let update = {
        width: widthRight + widthLeft + 1,
        height: heightUp + heightDown + 1,
        real_bottom_left: [real_anchor[0]-widthLeft, real_anchor[1]-heightDown]
    }
    let success;
    if (type === OBSTACLE_TYPE){
        success = grid.update_obstacle(obj_id, update).success;
    } else if (type === COIN_TYPE){
        success = grid.update_coin(obj_id, update).success;
    } else {
        console.log(`Tried to update invalid type (${type}) with id ${obj_id}`);
    }
    if (success){
        drawBoard();
    } else {
        CURRENT_SIZES[obj_id] = prevSize; //Go back to how it was
    }
}
/**
 * Adds controls to change the space to the right, left, top and bottom 
 * as well as translate the object right, left, up and down
 * 
 * This is only for obstacles and coins
 */
function onAddObject(obj){
    console.log("adding object");
    console.log(obj)
    let {type} = obj;
    let obj_id = obj.id;
    //Storing current sizes
    CURRENT_SIZES[obj_id] = {
        widthRight: Number(obj.width)-1,
        widthLeft: 0,
        heightUp: Number(obj.height)-1,
        heightDown: 0,
        real_anchor: obj.real_bottom_left,
      }
    let div = document.createElement("div");
    div.classList.add("bot-moving-controls");
    // controlsDiv.classList.add("bot-moving-controls")

    console.log(CURRENT_SIZES);
    div.setAttribute('id', `${type}-update-container-${obj_id}`);
    let header = document.createElement('h1');
    header.innerText = `${type}: ${obj_id}`;
    let moveUpButton = createButton(`moveUpButton-${obj_id}`, "⬆", [
        {
            key: "click",
            handler: (evt)=>{updateObj_ClickHandler(obj_id, type, {
                dy: 1,
            },evt)}
        }
    ]);
    let moveDownButton = createButton(`moveDownButton-${obj_id}`, "⬇", [
        {
            key: "click",
            handler: (evt)=>{updateObj_ClickHandler(obj_id, type, {
                dy: -1,
            },evt)}
        }
    ]);
    let moveLeftButton = createButton(`moveDownButton-${obj_id}`, "⬅", [
        {
            key: "click",
            handler: (evt)=>{updateObj_ClickHandler(obj_id, type, {
                dx: -1,
            },evt)}
        }
    ]);
    let moveRightButton = createButton(`moveDownButton-${obj_id}`, "⮕", [
        {
            key: "click",
            handler: (evt)=>{updateObj_ClickHandler(obj_id, type, {
                dx: 1,
            },evt)}
        }
    ]);
    //Resets to only the anchor
    let resetSizeButton = createButton(`resetSizeButton-${obj_id}`, 'Reset', [
        {
            key: "click",
            handler: (evt) => {updateObj_ClickHandler(obj_id, type, {
                dWidthLeft: - CURRENT_SIZES[obj_id].widthLeft,
                dWidthRight: - CURRENT_SIZES[obj_id].widthRight,
                dHeightUp: -CURRENT_SIZES[obj_id].heightUp,
                dHeightDown: -CURRENT_SIZES[obj_id].heightDown
            }), evt}
        }
    ])
    // let widthRightInput = createInput(`widthRightInput-${obj_id}`, "Width right ⮕", 'number', [
    //     {
    //         key: "change",
    //         handler: (evt)=>{updateObj_ClickHandler(obj_id, type, {
    //             dWidthRight: Number(evt.target.value) - CURRENT_SIZES[obj_id].widthRight
    //         },evt)}
    //     }
    // ]);
    let widthRightIncreaseButton = createButton(`widthRightIncreaseButton-${obj_id}`, "+", [
        {
            key: "click",
            handler: (evt)=>{updateObj_ClickHandler(obj_id, type, {
                dWidthRight: 1
            },evt)}
        }
    ]);
    let widthRightDecreaseButton = createButton(`widthRightDecreaseButton-${obj_id}`, "-", [
        {
            key: "click",
            handler: (evt)=>{updateObj_ClickHandler(obj_id, type, {
                dWidthRight: -1
            },evt)}
        }
    ]);
    let widthLeftIncreaseButton = createButton(`widthLeftIncreaseButton-${obj_id}`, "+", [
        {
            key: "click",
            handler: (evt)=>{updateObj_ClickHandler(obj_id, type, {
                dWidthLeft: 1
            },evt)}
        }
    ]);
    let widthLeftDecreaseButton = createButton(`widthLeftDecreaseButton-${obj_id}`, "-", [
        {
            key: "click",
            handler: (evt)=>{updateObj_ClickHandler(obj_id, type, {
                dWidthLeft: -1
            },evt)}
        }
    ]);
    let heightUpIncreaseButton = createButton(`heightUpIncreaseButton-${obj_id}`, "+", [
        {
            key: "click",
            handler: (evt)=>{updateObj_ClickHandler(obj_id, type, {
                dHeightUp: 1
            },evt)}
        }
    ]);
    let heightUpDecreaseButton = createButton(`heightUpDecreaseButton-${obj_id}`, "-", [
        {
            key: "click",
            handler: (evt)=>{updateObj_ClickHandler(obj_id, type, {
                dHeightUp: -1
            },evt)}
        }
    ]);
    let heightDownIncreaseButton = createButton(`heightDownIncreaseButton-${obj_id}`, "+", [
        {
            key: "click",
            handler: (evt)=>{updateObj_ClickHandler(obj_id, type, {
                dHeightDown: 1
            },evt)}
        }
    ]);
    let heightDownDecreaseButton = createButton(`heightDownDecreaseButton-${obj_id}`, "-", [
        {
            key: "click",
            handler: (evt)=>{updateObj_ClickHandler(obj_id, type, {
                dHeightDown: -1
            },evt)}
        }
    ]);
    // let widthLeftInput = createInput(`widthLeftInput-${obj_id}`, "Width left ⬅", 'number', [
    //     {
    //         key: "change",
    //         handler: (evt)=>{updateObj_ClickHandler(obj_id, type, {
    //             dWidthLeft: Number(evt.target.value) - CURRENT_SIZES[obj_id].widthLeft
    //         },evt)}
    //     }
    // ]);
    // let heightUpInput = createInput(`heightUpInput-${obj_id}`, "Height up ⬆", 'number', [
    //     {
    //         key: "change",
    //         handler: (evt)=>{updateObj_ClickHandler(obj_id, type, {
    //             dHeightUp: Number(evt.target.value) - CURRENT_SIZES[obj_id].heightUp
    //         },evt)}
    //     }
    // ]);
    // let heightDownInput = createInput(`heightDownInput-${obj_id}`, "Height down ⬇", 'number', [
    //     {
    //         key: "change",
    //         handler: (evt)=>{updateObj_ClickHandler(obj_id, type, {
    //             dHeightDown: Number(evt.target.value) - CURRENT_SIZES[obj_id].heightDown
    //         },evt)}
    //     }
    // ]);

    div.appendChild(header)
    div.appendChild(moveUpButton)
    div.appendChild(moveDownButton)
    div.appendChild(moveLeftButton)
    div.appendChild(moveRightButton)
    let groups = [
        {text:"Right width: ", buttons: [widthRightIncreaseButton, widthRightDecreaseButton]},
        {text:"Left width: ", buttons: [widthLeftIncreaseButton, widthLeftDecreaseButton]},
        {text:"Up height: ", buttons: [heightUpIncreaseButton, heightUpDecreaseButton]},
        {text:"Down height: ", buttons: [heightDownIncreaseButton, heightDownDecreaseButton]},
    ]
    for (let {text, buttons} of groups){
        let miniContainer = document.createElement('div');
        let label = document.createElement('label');
        label.innerText = text;
        miniContainer.appendChild(label);
        for (let button of buttons){
            miniContainer.appendChild(button);
        }
        div.appendChild(miniContainer)
    }
    div.appendChild(resetSizeButton);
    updateObjectContainer.appendChild(div);
}
function distanceSelect_ChangeHandler(bot_id, evt){
    let newDistance = evt.target.value;
    grid.update_bot_distance(bot_id, newDistance);
}
function onlyReachableCheckbox_ChangeHandler(bot_id, evt){
    grid.update_only_reachable(bot_id, evt.target.checked);
}
/**
 * Creates handlers for bots
 * @param {*} bot 
 */
function onAddBot(bot){
    let bot_id = bot.id;
    let div = document.createElement('div');
    div.setAttribute('id', `bot-controls-container-${bot_id}`)
    div.classList.add("bot-options");
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
    // The changeMovingButton would be made after `positionState` changes
    // let changeMovingButton = createButton(`changeMovingButton-${bot_id}`, "Start moving", [
    //     {
    //         key: "click",
    //         handler: (evt)=>{changeMoving_ClickHandler(bot_id, evt)}
    //     }
    // ]);
    // changeMovingButton.classList.add("bot-moving-btn");
    // changeMovingButton.classList.add("bot-start")
    // let policySelect = createSelect(`policySelect-${bot_id}`, "Select a moving policy:", POLICY_SELECT_OPTIONS, [
    //     {
    //         key: "change",
    //         handler: (evt)=>{policySelect_ChangeHandler(bot_id, evt)}
    //     }
    // ]);
    let policyCheckboxGroupDiv = createCheckboxGroup(bot_id, `policyCheckboxGroup-${bot_id}`, BOT_POLICIES);

    let policyContainer = document.createElement('div');
    policyContainer.classList.add("bot-policy-container");
    let policyTextHeader = document.createElement('h2');
    policyTextHeader.innerText = "Select a policy:";
    policyContainer.appendChild(policyTextHeader);
    policyContainer.appendChild(policyCheckboxGroupDiv);
    // policyContainer.appendChild(changeMovingButton);

    let otherOptionsContainer = document.createElement('div');
    otherOptionsContainer.classList.add("bot-other-options-container");
    let otherOptionsHeader = document.createElement('h2');
    otherOptionsHeader.innerText = "Other options"
    let distanceSelect = createSelect(`distanceSelect-${bot_id}`, `Select a type of distance: `, Object.values(DISTANCE_VALUES), [
        {
            key: "change",
            handler: (evt)=>{distanceSelect_ChangeHandler(bot_id, evt)}
        }
    ]);
    let onlyReachableCheckbox = createInput(`onlyReachable-${bot_id}`, `Only consider reachable points`, 'checkbox', [
        {
            key: "change",
            handler: (evt) => {onlyReachableCheckbox_ChangeHandler(bot_id, evt)}
        }
    ])
    otherOptionsContainer.appendChild(otherOptionsHeader);
    otherOptionsContainer.appendChild(distanceSelect);
    otherOptionsContainer.appendChild(onlyReachableCheckbox);

    div.appendChild(controlsDiv);
    div.appendChild(policyContainer);
    div.appendChild(otherOptionsContainer);
    botControlsContainer.appendChild(div);
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
    let angle = grid.get_bot_angle(bot_id);
    let diff = (new_direction - angle) % 360;
    if (diff < 0){ diff += 360; } //Make sure diff is non-negative
    // console.log(`Found diff = ${diff}`);
    if (diff === 0){
        console.log("Moving 1!")
        grid.move_bot(bot_id, 1);
    } else{
        for (let i = 0; i < diff; i+=90){
            grid.turn_bot(bot_id, 90);
        }
    }
    drawBoard();
}
function turnOrMove_ClickHandler(bot_id, new_direction, evt){
    console.log(`Trying to move bot ${bot_id} to direction ${new_direction}`)
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
/**
 * Removes controls for bots
 * @param {*} bot 
 */
function onRemoveBot(bot){
    document.getElementById(`bot-controls-container-${bot.id}`).remove();
}
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