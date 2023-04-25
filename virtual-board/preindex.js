//get variables
console.log("i am in js file");
var themes = document.getElementsByName("theme");
var body = document.getElementById("body");
// var dropdownButton = document.getElementById("dropdownMenuButton");
// var dropdownOptions = document.querySelectorAll(".dropdown-item");
var virtualMode = document.getElementById("virtualMode");
var realVideoStream = document.getElementById("realVideoStream");

//background change according to selected theme
for (let i = 0; i < themes.length; i++) {
  themes[i].addEventListener("click", function () {
    if (this.checked) {
      const value = this.value;
      if (value == "None") {
        virtualMode.setAttribute("name", "None");
        body.className =
          "background1 d-flex justify-content-center align-items-center vh-100";
        console.log(virtualMode.getAttribute("name"));
      } else if (value == "City") {
        virtualMode.setAttribute("name", "City");
        body.className =
          "background2 d-flex justify-content-center align-items-center vh-100";
        console.log(virtualMode.getAttribute("name"));
      } else if (value == "School") {
        virtualMode.setAttribute("name", "None");
        body.className =
          "background1 d-flex justify-content-center align-items-center vh-100";
        console.log(virtualMode.getAttribute("name"));
      } else if (value == "Pacman") {
        virtualMode.setAttribute("name", "Pacman");
        body.className =
          "background3 d-flex justify-content-center align-items-center vh-100";
        console.log(virtualMode.getAttribute("name"));
      } else {
        virtualMode.setAttribute("name", "None");
        body.className =
          "background1 d-flex justify-content-center align-items-center vh-100";
        console.log(virtualMode.getAttribute("name"));
      }
    }
  });
}

// dropdownOptions.forEach(function (option) {
//   option.addEventListener("click", function () {
//     dropdownButton.innerText = option.innerText;
//     var body = document.getElementById("body");
//     console.log("test here");
//     console.log(option.innerText);
//     if (option.innerText == "City") {
//       virtualMode.setAttribute("name", "City");
//       body.className =
//         "background2 d-flex justify-content-center align-items-center vh-100";
//       console.log(virtualMode.getAttribute("name"));
//     } else if (option.innerText == "None" || option.innerText == null) {
//       console.log("im null");
//       virtualMode.setAttribute("name", "None");
//       body.className =
//         "background1 d-flex justify-content-center align-items-center vh-100";
//       console.log(virtualMode.getAttribute("name"));
//     } else if (option.innerText == "Pacman") {
//       virtualMode.setAttribute("name", "Pacman");
//       body.className =
//         "background3 d-flex justify-content-center align-items-center vh-100";
//       console.log(virtualMode.getAttribute("name"));
//     } else if (option.innerText == "School") {
//       virtualMode.setAttribute("name", "School");
//       body.className =
//         "background1 d-flex justify-content-center align-items-center vh-100";
//       console.log(virtualMode.getAttribute("name"));
//     }
//   });
// });

//Go to virtualMode page
if (virtualMode) {
  virtualMode.addEventListener("click", function () {
    console.log(virtualMode.getAttribute("name"));
    var currentOption = virtualMode.getAttribute("name");
    var url = "virtualMode.html?option=" + currentOption;
    window.location.href = url;
  });
}
