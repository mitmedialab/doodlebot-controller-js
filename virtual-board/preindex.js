//get variables
var dropdownButton = document.getElementById("dropdownMenuButton");
var dropdownOptions = document.querySelectorAll(".dropdown-item");
var virtualMode = document.getElementById("virtualMode");
var realVideoStream = document.getElementById("realVideoStream");

//dropdown and background change according to selected theme
dropdownOptions.forEach(function (option) {
  option.addEventListener("click", function () {
    dropdownButton.innerText = option.innerText;
    var body = document.getElementById("body");
    if (option.innerText == "City") {
      virtualMode.setAttribute("name", "City");
      body.className =
        "background2 d-flex justify-content-center align-items-center vh-100";
      console.log(virtualMode.getAttribute("name"));
    } else if (option.innerText == "None") {
      virtualMode.setAttribute("name", "None");
      body.className =
        "background1 d-flex justify-content-center align-items-center vh-100";
      console.log(virtualMode.getAttribute("name"));
    } else if (option.innerText == "Pacman") {
      virtualMode.setAttribute("name", "Pacman");
      body.className =
        "background3 d-flex justify-content-center align-items-center vh-100";
      console.log(virtualMode.getAttribute("name"));
    } else if (option.innerText == "School") {
      virtualMode.setAttribute("name", "School");
      body.className =
        "background1 d-flex justify-content-center align-items-center vh-100";
      console.log(virtualMode.getAttribute("name"));
    }
  });
});

//Go to virtualMode page
if (virtualMode) {
  virtualMode.addEventListener("click", function () {
    console.log(virtualMode.getAttribute("name"));
    var currentOption = virtualMode.getAttribute("name");
    var url = "virtualMode.html?option=" + currentOption;
    window.location.href = url;
  });
}
