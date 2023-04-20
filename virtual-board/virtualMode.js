//make sure background and images match the selected theme
var body = document.getElementById("body");
var botsDiv = document.getElementById("bots");
var obstaclesDiv = document.getElementById("obstacles");
var coinsDiv = document.getElementById("coins");

var urlParams = new URLSearchParams(window.location.search);
var selectedOption = urlParams.get("option");
console.log(selectedOption);

if (selectedOption == "City") {
  body.className =
    "background2 d-flex justify-content-center align-items-center vh-100";
  botsDiv.innerHTML =
    '<img id="img1" alt="bot" src="../assets/DB_Car_1.png" style="width:50px; height:70px; padding-right:5px;">' +
    '<img id="img1" alt="bot" src="../assets/DB_Car_2.png" style="width:50px; height:70px; padding-right:5px;">' +
    '<img id="img1" alt="bot" src="../assets/DB_Car_3.png" style="width:50px; height:70px; padding-right:5px;">' +
    '<img id="img1" alt="bot" src="../assets/DB_Truck_1.png" style="width:50px; height:70px; padding-right:5px;">';
  obstaclesDiv.innerHTML =
    '<img id="img1" alt="bot" src="../assets/DB_River_1.png" style="width:40px; height:60px; padding-right:5px;">' +
    '<img id="img1" alt="bot" src="../assets/DB_Bush_1.png" style="width:60px; height:60px; padding-right:5px;">';
  coinsDiv.innerHTML =
    '<img id="img1" alt="bot" src="../assets/DB_Pizza_1.png" style="width:50px; height:50px; padding-right:5px;">' +
    '<img id="img1" alt="bot" src="../assets/DB_Coffee_1.png" style="width:50px; height:50px; padding-right:5px;">';
} else if (
  selectedOption == "None" ||
  selectedOption === undefined ||
  selectedOption === null
) {
  body.className =
    "background1 d-flex justify-content-center align-items-center vh-100";
  botsDiv.innerHTML =
    '<img id="img1" alt="bot" src="../assets/DB_Robot_1.png" style="width:60px; height:70px; padding-right:5px;">' +
    '<img id="img1" alt="bot" src="../assets/DB_Robot_2.png" style="width:60px; height:70px; padding-right:5px;">' +
    '<img id="img1" alt="bot" src="../assets/DB_Robot_3.png" style="width:60px; height:70px; padding-right:5px;">' +
    '<img id="img1" alt="bot" src="../assets/None_Doodlebot.png" style="width:60px; height:60px; padding-right:5px;">' +
    '<img id="img1" alt="bot" src="../assets/None_Doodlebot_Cowboy.png" style="width:60px; height:60px; padding-right:5px;">';
  obstaclesDiv.innerHTML =
    '<img id="img1" alt="bot" src="../assets/None_Building.png" style="width:40px; height:60px; padding-right:5px;">' +
    '<img id="img1" alt="bot" src="../assets/None_Building.png" style="width:40px; height:60px; padding-right:5px;">';
  coinsDiv.innerHTML =
    '<img id="img1" alt="bot" src="../assets/None_Coin.png" style="width:50px; height:50px; padding-right:5px;">' +
    '<img id="img1" alt="bot" src="../assets/None_Coin.png" style="width:50px; height:50px; padding-right:5px;">' +
    '<img id="img1" alt="bot" src="../assets/Star_1.png" style="width:50px; height:50px; padding-right:5px;">' +
    '<img id="img1" alt="bot" src="../assets/Star_1.png" style="width:50px; height:50px; padding-right:5px;">';
} else if (selectedOption == "School") {
  body.className =
    "background1 d-flex justify-content-center align-items-center vh-100";
} else if (selectedOption == "Pacman") {
  body.className =
    "background3 d-flex justify-content-center align-items-center vh-100";
  botsDiv.innerHTML =
    '<img id="img1" alt="bot" src="../assets/DB_GhostBlue_1.png" style="width:50px; height:50px; padding-right:5px;">' +
    '<img id="img1" alt="bot" src="../assets/DB_GhostOrange_1.png" style="width:50px; height:50px; padding-right:5px;">' +
    '<img id="img1" alt="bot" src="../assets/DB_GhostPink_1.png" style="width:50px; height:50px; padding-right:5px;">' +
    '<img id="img1" alt="bot" src="../assets/DB_GhostRed_1.png" style="width:50px; height:50px; padding-right:5px;">' +
    '<img id="img1" alt="bot" src="../assets/DB_Pacman_1.png" style="width:50px; height:50px; padding-right:5px;">';
  obstaclesDiv.innerHTML =
    '<img id="img1" alt="bot" src="../assets/DB_PacmanWall_1.png" style="width:40px; height:60px; padding-right:5px;">' +
    '<img id="img1" alt="bot" src="../assets/DB_PacmanWall_1.png" style="width:40px; height:60px; padding-right:5px;">';
  coinsDiv.innerHTML =
    '<img id="img1" alt="bot" src="../assets/DB_PacmanFood_1.png" style="width:50px; height:50px; padding-right:5px;">' +
    '<img id="img1" alt="bot" src="../assets/DB_PacmanFood_1.png" style="width:50px; height:50px; padding-right:5px;">' +
    '<img id="img1" alt="bot" src="../assets/DB_PacmanCherry_1.png" style="width:50px; height:50px; padding-right:5px;">' +
    '<img id="img1" alt="bot" src="../assets/DB_PacmanCherry_1.png" style="width:50px; height:50px; padding-right:5px;">';
}

//collapsable sidebar

function start() {
  var startButton = document.getElementById("startbtn");
  if (startButton.innerHTML === "Start") {
    startButton.innerHTML = "Stop";
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("controls").style.visibility = "hidden";
    document.getElementById("objects").style.visibility = "hidden";
    document.getElementById("main").style.marginLeft = "250px";
    startButton.className = "startbtn btn btn-danger";
  } else {
    startButton.innerHTML = "Start";
    document.getElementById("controls").style.visibility = "visible";
    document.getElementById("objects").style.visibility = "visible";
    document.getElementById("mySidebar").style.width = "500px";
    document.getElementById("main").style.marginLeft = "500px";
    startButton.className = "startbtn btn btn-success";
  }
}
