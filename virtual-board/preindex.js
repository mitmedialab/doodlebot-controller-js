//get variables
console.log("i am in js file");
var themes = document.getElementsByName("theme");
var body = document.getElementById("body");
// var dropdownButton = document.getElementById("dropdownMenuButton");
// var dropdownOptions = document.querySelectorAll(".dropdown-item");
var heading2 = document.getElementsByTagName("h2");
var heading4 = document.getElementsByTagName("h4");
var label = document.getElementsByName("indexLabel");
var virtualMode = document.getElementById("virtualMode");
var realVideoStream = document.getElementById("realVideoStream");

//background change according to selected theme
for (let i = 0; i < themes.length; i++) {
  themes[i].addEventListener("click", function () {
    if (this.checked) {
      const value = this.value;
      if (value == "None") {
        virtualMode.setAttribute("name", "None");
        realVideoStream.setAttribute("name", "None");
        body.className =
          "background1 d-flex justify-content-center align-items-center vh-100";
        for (var i = 0; i < heading2.length; i++) {
          heading2[i].style.color = "antiquewhite";
        }
        for (var i = 0; i < label.length; i++) {
          label[i].style.color = "antiquewhite";
        }
        for (var i = 0; i < heading4.length; i++) {
          heading4[i].style.color = "antiquewhite";
        }
        console.log(virtualMode.getAttribute("name"));
        console.log(realVideoStream.getAttribute("name"));
      } else if (value == "City") {
        virtualMode.setAttribute("name", "City");
        realVideoStream.setAttribute("name", "City");
        body.className =
          "background2 d-flex justify-content-center align-items-center vh-100";
        for (var i = 0; i < heading2.length; i++) {
          heading2[i].style.color = "antiquewhite";
        }
        for (var i = 0; i < label.length; i++) {
          label[i].style.color = "antiquewhite";
        }
        for (var i = 0; i < heading4.length; i++) {
          heading4[i].style.color = "antiquewhite";
        }
        console.log(virtualMode.getAttribute("name"));
        console.log(realVideoStream.getAttribute("name"));
      } else if (value == "School") {
        virtualMode.setAttribute("name", "School");
        realVideoStream.setAttribute("name", "School");
        body.className =
          "background4 d-flex justify-content-center align-items-center vh-100";
        for (var i = 0; i < heading2.length; i++) {
          heading2[i].style.color = "black";
        }
        for (var i = 0; i < label.length; i++) {
          label[i].style.color = "black";
        }
        for (var i = 0; i < heading4.length; i++) {
          heading4[i].style.color = "black";
        }
        console.log(virtualMode.getAttribute("name"));
        console.log(realVideoStream.getAttribute("name"));
      } else if (value == "Pacman") {
        virtualMode.setAttribute("name", "Pacman");
        realVideoStream.setAttribute("name", "Pacman");
        body.className =
          "background3 d-flex justify-content-center align-items-center vh-100";
        for (var i = 0; i < heading2.length; i++) {
          heading2[i].style.color = "antiquewhite";
        }
        for (var i = 0; i < label.length; i++) {
          label[i].style.color = "antiquewhite";
        }
        for (var i = 0; i < heading4.length; i++) {
          heading4[i].style.color = "antiquewhite";
        }
        console.log(virtualMode.getAttribute("name"));
        console.log(realVideoStream.getAttribute("name"));
      } else {
        virtualMode.setAttribute("name", "None");
        realVideoStream.setAttribute("name", "None");
        body.className =
          "background1 d-flex justify-content-center align-items-center vh-100";
        console.log(virtualMode.getAttribute("name"));
        console.log(realVideoStream.getAttribute("name"));
      }
    }
  });
}

//Go to virtualMode page
if (virtualMode) {
  virtualMode.addEventListener("click", function () {
    console.log(virtualMode.getAttribute("name"));
    var currentOption = virtualMode.getAttribute("name");
    var url = `virtualMode.html?option=${currentOption}&mode=virtual&room=${roomId}`;
    live_updates.choose_theme({
      option: currentOption,
      mode: "virtual",
      roomId: roomId,
    });
    window.location.href = url;
  });
}

//Go to Real Video Stream Page
if (realVideoStream) {
  realVideoStream.addEventListener("click", function () {
    console.log(realVideoStream.getAttribute("name"));
    var currentOption = realVideoStream.getAttribute("name");
    var url = `virtualMode.html?option=${currentOption}&mode=camera&room=${roomId}`;
    live_updates.choose_theme({
      option: currentOption,
      mode: "camera",
      roomId: roomId,
    });
    window.location.href = url;
  });
}
