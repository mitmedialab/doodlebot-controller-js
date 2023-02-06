let grid;
document.addEventListener('DOMContentLoaded', () => {
    let rows = 10;
    let cols = 20;
    grid = new VirtualGrid(rows, cols);
    drawBoard();
})
function log(message) {
  logDiv.value = message + "\n" + logDiv.value;
}
function drawBoard(){
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
// let all_bot_ids = [];
// let min_bot_id = 1;
// let all_obstacle_ids = [];
// let min_obstacle_id = 11;

// let min_coin_id = 21;

// let obstacle_id_1 = 10;
// function getNewBotId(){
//     //TODO: Make sure it doesnt crash with an obstacle id
//     let max_bot_id = Math.max(min_bot_id-1, ...all_bot_ids);
//     return max_bot_id + 1;
// }
// function getNewObstacleId(){
//     let max_obstacle_id = Math.max(min_obstacle_id-1, ...all_obstacle_ids);
//     return max_obstacle_id + 1;
// }
// function getNewCoinId(){
//     let max_coin_id = Math.max(min_coin_id-1, ...all_coin_ids);
//     return max_coin_id + 1;
// }
create_grid_button.addEventListener("click", (evt)=>{
    let rows = 10;
    let cols = 12;
    grid = new VirtualGrid(rows, cols);
    drawBoard();
})
/**
 *
        <button id="moveButton">Move</button>
        <button id="moveBackwardsButton">Go back</button>
        <button id="turn90Button">Turn 90deg</button>
        <button id="startMovingButton">Start moving (don't forget to select a policy!)</button>
        <label for="policySelect"> Select a policy: </label>
        <select id="policySelect" >
            <option value="none" >None</option>
            <option value="random">Random moves</option>
        </select>
        <button id="stopButton">Stop moving!</button>
 */
function createButton(id, text, listeners=[]){
    let button = document.createElement('button');
    button.innerText = text;
    button.setAttribute('id', id);
    for (let listener of listeners){
        let {key, handler} = listener;
        button.addEventListener(key, handler);
    }
    return button;
}
//options is an array of {value:, text:} objects
function createSelect(id, labelText, options, listeners=[]){
    let div = document.createElement('div');
    // let label = document.createElement('label');
    // label.innerText = labelText;
    let select = document.createElement('select');
    select.setAttribute('id', id);
    for (let option of options){
        let {value, text} = option;
        let newOption = document.createElement('option');
        newOption.setAttribute('value', value);
        newOption.innerText = text;
        select.appendChild(newOption);
    }
    for (let listener of listeners){
        let {key, handler} = listener;
        select.addEventListener(key, handler);
    }
    // div.appendChild(label);
    div.appendChild(select);
    return div;
}
/**
 * 
 * @param {*} bot_id 
 * @param {*} container_id 
 * @param {*} options {key: {value: "value", text:"text value"}}
 * @returns 
 */
function createCheckboxGroup(bot_id, container_id, options){
    let container = document.createElement('div');
    container.classList.add('checkbox-group');
    container.setAttribute('id', container_id);
    for (let [key, {value, text}] of Object.entries(options)){
        let input = document.createElement('input');
        let inputId = `${container_id}-value-${value}`
        input.setAttribute('type', 'checkbox');
        input.setAttribute('id', inputId);
        let label = document.createElement('label');
        label.setAttribute('for', inputId);
        label.innerText = text;
        input.addEventListener('change', (evt)=>{
            changeCheckbox_changeHandler(bot_id, key, evt);
        })
        let subContainer = document.createElement('div');
        subContainer.appendChild(label);
        subContainer.appendChild(input);
        container.appendChild(subContainer);
    }
    return container;
}
function moveButton(bot_id){
    return document.getElementById(`moveButton-${bot_id}`);
}
// let POLICY_SELECT_OPTIONS = [
//     {
//         value: "none",
//         text: "None"
//     },
//     {
//         value: "random",
//         text: "Random moves"
//     }
// ]

// 'value' should match the values of BOT_POLICIES in grid.js
// let POLICY_CHECKBOX_OPTIONS = [
//     {
//         value: "random",
//         text: "Random moves"
//     },
//     {
//         value: "Get closer",
//         text: "Get closer"
//     },
//     {
//         value: "Get farther",
//         text: "Get farther"
//     }
// ]
function create_bot_options(bot){
    let bot_id = bot.id;
    let div = document.createElement('div');
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

    let changeMovingButton = createButton(`changeMovingButton-${bot_id}`, "Start moving", [
        {
            key: "click",
            handler: (evt)=>{changeMoving_ClickHandler(bot_id, evt)}
        }
    ]);
    changeMovingButton.classList.add("bot-moving-btn");
    changeMovingButton.classList.add("bot-start")
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
    policyContainer.appendChild(changeMovingButton);


    div.appendChild(controlsDiv);
    div.appendChild(policyContainer)
    botControlsContainer.appendChild(div);
}
addBotButton.addEventListener("click", (evt)=>{
    console.log("Create bot")
    let new_bot_id = grid.getNewBotId();
    console.log(new_bot_id)
    let row = Number(botRowNumberInput.value);
    let col = Number(botColNumberInput.value);
    let bot = {
        id: new_bot_id, 
        real_bottom_left: [col, row],
        relative_anchor: [1, 1],
        width: 3,
        height: 3,
        angle: 0, //Right
    }
    let {success, message} = grid.add_bot(bot);
    if (!success){
        log(message);
        return;
    }
    // all_bot_ids.push(new_bot_id);
    drawBoard();

    //Add it to options
    create_bot_options(bot)
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
    // all_obstacle_ids.push(obstacleId);

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
    drawBoard();
})
addRandomBotButton.addEventListener("click", evt=>{
    let {bot} = grid.add_random_bot();
    drawBoard();
    create_bot_options(bot)
})
addRandomObstacleButton.addEventListener('click', (evt)=>{
    grid.add_random_obstacle();
    drawBoard();
})
addRandomCoinButton.addEventListener('click', (evt)=>{
    grid.add_random_coin();
    drawBoard();
})
openEditorBot.addEventListener("click", evt=>{
    botEditorDiv.classList.toggle("editor-hide");
})
openEditorObstacle.addEventListener("click", evt => {
    obstacleEditorDiv.classList.toggle("editor-hide");
})
openEditorCoin.addEventListener("click", evt=> {
    coinEditorDiv.classList.toggle("editor-hide");
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
    // console.log("Turning 90")
    let {success, bot} = grid.turn_bot(bot_id, 90);
    updateCrashes(bot);
    drawBoard();
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
        moveBot(bot_id, 1);
    } else{
        for (let i = 0; i < diff; i+=90){
            turnBot90(bot_id);
        }
    }
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
        let {bot} = grid.move_bot_using_policies(bot_id);
        //TODO: Check if the `bot` object has been updated
        updateCrashes(bot);
        drawBoard();
    }
    intervals[bot_id] = setInterval(move, 500);
}

function stopMovingButton_ClickHandler(bot_id, evt){
    clearInterval(intervals[bot_id]);
    delete intervals[bot_id];
}

// function policySelect_ChangeHandler(bot_id, evt){
//     let newPolicy = evt.target.value;
//     grid.update_bot_policy(bot_id, newPolicy);
// }
function changeCheckbox_changeHandler(bot_id, key, evt){
    grid.update_bot_policy(bot_id, key, evt.target.checked);
}