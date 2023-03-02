const {train} = require("./train.js")
const express = require("express")
const cors = require("cors");
const bodyParser = require("body-parser")
const morgan = require("morgan")
const app = express();
app.use(bodyParser.json({extended: true}))
app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(morgan("dev"))
app.use(cors())

const port = 5000;
const fs = require('fs');
function addHistoryToFile(history){
    let path = "data.json"
    let data = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)): {};
    console.log(data);
    data.history.push(history);
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}
app.post('/record', function (req, res) {
  let {history} = req.body;
  console.log(history);
  addHistoryToFile(history);
  res.send({success: true})
})
app.get("/train", (req, res) => {
    let json_file = "data.json";
    let output_file = "model.h5";
    train(json_file, output_file);
})
app.get('/', function (req, res) {
  res.send('GET reques to homepage')
})

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
}); 