let grid;
function drawBoard(board){
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
            if (text.startsWith("bot")){
                cell.classList.add("cell-bot")
            } else if (text.startsWith("obs")){
                cell.classList.add("cell-obstacle")
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

    console.log(ANGLE_DIRS);
    const angle_to_text = (angle) => {
        angle = Number(angle)
        console.log(`Angle = ${angle}`)
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
    console.log(grid.bots)
    for (let [bot_id, bots] of Object.entries(grid.bots)){
        // console.log(bots);
        let bot = bots[0] //TODO: Change his for all indices
        console.log(angle_to_text(bot.angle))
        text += `Bot #${bot_id}: ${angle_to_text(bot.angle)} \n`
    }
    botDirectionsDiv.innerText = text;
}
let all_bot_ids = [];
let min_bot_id = 1;
let all_obstacle_ids = [];
let min_obstacle_id = 11;

let obstacle_id_1 = 10;
function getNewBotId(){
    //TODO: Make sure it doesnt crash with an obstacle id
    let max_bot_id = Math.max(min_bot_id-1, ...all_bot_ids);
    return max_bot_id + 1;
}
function getNewObstacleId(){
    let max_obstacle_id = Math.max(min_obstacle_id-1, ...all_obstacle_ids);
    return max_obstacle_id + 1;
}
create_grid_button.addEventListener("click", (evt)=>{
    let rows = 10;
    let cols = 12;
    grid = new VirtualGrid(rows, cols);
    let board = grid.print_board();
    drawBoard(board);
})

addBotButton.addEventListener("click", (evt)=>{
    console.log("Create bot")
    let new_bot_id = getNewBotId();
    console.log(new_bot_id)
    let bot = {
        id: new_bot_id, 
        real_bottom_left: [0, 0],
        relative_anchor: [1, 1],
        width: 3,
        height: 3,
        angle: 0, //Right
    }
    grid.add_bot(bot);
    all_bot_ids.push(new_bot_id);
    console.log(grid.bots)
    console.log({...grid.bots[new_bot_id][0]})
    let board = grid.print_board();
    drawBoard(board);

    //Add it to options
    let option = document.createElement('option');
    option.setAttribute('value', new_bot_id);
    option.setAttribute('label', `id ${new_bot_id}`);
    botSelect.appendChild(option);
})
addObstacleButton.addEventListener("click", (evt)=>{
    let obstacleId = getNewObstacleId();
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
    grid.add_obstacle(obstacle);
    all_obstacle_ids.push(obstacleId);

    let board = grid.print_board();
    drawBoard(board);
})

function updateCrashes(bot){
    console.log(bot.almost_crashes);
    let text = `Info for bot #${bot.id} \n`;
    if (bot.almost_crashes.length === 0){
        text += "No crashes to be expected!"
    } else{
        for (let [obstacle_id, obstacle_index] of bot.almost_crashes){
            text += `Potential crash with obstacle ${obstacle_id} \n`;
        }
    }
    botCrashLog.value = text;
}
moveButton.addEventListener("click", (evt)=>{
    let bot_id = botSelect.value;
    console.log("move 1");
    let bot = grid.move_bot(bot_id, 1);
    updateCrashes(bot);
    let board = grid.print_board();
    drawBoard(board);
})
turn90Button.addEventListener("click", (evt)=>{
    let bot_id = botSelect.value;
    console.log("Turning 90")
    let bot = grid.turn_bot(bot_id, 90);
    updateCrashes(bot);
    let board = grid.print_board();
    drawBoard(board);
})