let doodlebot;

connectInternetButton.addEventListener("click", async function () {
  let network = "PRG-MIT";
  let pwd = "JiboLovesPizzaAndMacaroni1";
  doodlebot.connectToWifi(network, pwd);
});

function log(message) {
  logBox.value = message + "\n" + logBox.value;
}
function onReceiveValue(evt) {
  const view = evt.target.value;
  log("Received:");
  log(view);
  var enc = new TextDecoder("utf-8"); // always utf-8
  log(enc.decode(view.buffer));
}
async function populateBluetoothDevices() {
  try {
    log("Trying to connect...");
    await doodlebot.connect();
    const devicesSelect = document.querySelector("#devicesSelect");
    const option = document.createElement("option");
    option.value = doodlebot.bot.id;
    option.textContent = doodlebot.bot.name;
    devicesSelect.appendChild(option);
  } catch (error) {
    log("Argh! " + error);
  }
}
async function onRequestBluetoothDeviceButtonClick() {
  try {
    doodlebot = new Doodlebot(log, onReceiveValue);
    await doodlebot.request_device();
    populateBluetoothDevices();
  } catch (error) {
    log("Argh! " + error);
  }
}
