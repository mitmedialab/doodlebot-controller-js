const fs = require("fs");

function train(json_file, output_file){
    let file_data = fs.existsSync(json_file) ? JSON.parse(fs.readFileSync(json_file)): {};
    let train_data = file_data.history || [];
    for (let train_point of train_data){
        /**
         * type: ['move', 1] or ['turn', 90, 180 or 270]
         * angle: 0, 90, 180 or 270, representing the angle the bot was looking at before the move
         * position: [i, j] of the `real_bottom_left` of the bot
         * status: Boolean binary board, of the same shape as the grid, where true means that there was an obstacle 
         * there (or another bot)
         */
        let {type, angle, position, status} = train_point;
    }
}

module.exports = {
    train
}