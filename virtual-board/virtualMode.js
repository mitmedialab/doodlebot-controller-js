//make sure background matches the selected mode
var urlParams = new URLSearchParams(window.location.search);
var selectedOption = urlParams.get("option");

if (selectedOption == "City") {
  body.className =
    "background2 d-flex justify-content-center align-items-center vh-100";
} else if (selectedOption == "None") {
  body.className =
    "background1 d-flex justify-content-center align-items-center vh-100";
} else if (selectedOption == "School") {
  body.className =
    "background1 d-flex justify-content-center align-items-center vh-100";
} else if (selectedOption == "Pacman") {
  body.className =
    "background3 d-flex justify-content-center align-items-center vh-100";
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
