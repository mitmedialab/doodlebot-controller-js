let dropdownButton = document.getElementById("dropdownMenuButton");
let dropdownOptions = document.querySelectorAll(".dropdown-item");
//dropdown and background change according to selected theme
dropdownOptions.forEach(function (option) {
  option.addEventListener("click", function () {
    dropdownButton.innerText = option.innerText;
    var body = document.getElementById("body");
    if (option.innerText == "City") {
      body.className =
        "background2 d-flex justify-content-center align-items-center vh-100";
    } else {
      body.className =
        "background1 d-flex justify-content-center align-items-center vh-100";
    }
  });
});
