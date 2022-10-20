let doodlebot;

function log(message) {
  logBox.value = message + "\n" + logBox.value;
}
// function time(text) {
//   log("[" + new Date().toJSON().substr(11, 8) + "] " + text);
// }
sendCommandButton.addEventListener("click", async function () {
  let commands = botCommand.value;
  await doodlebot.sendCommandToRobot(commands);
});
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}
testMovementButton.addEventListener('click', async function(){
  await doodlebot.drive({NUM: 100});
  await sleep(2000); //TODO: Update sendCommandToRobot so that this is not needed

  await doodlebot.turn({NUM: 90, DIR: 'right'});
  await sleep(2000);

  await doodlebot.drive({NUM: 100});
  await sleep(2000);

  await doodlebot.turn({NUM: 90, DIR: 'left'});
  await sleep(2000);
})
connectInternetButton.addEventListener("click", async function () {
  let network = "PRG-MIT";
  let pwd = "JiboLovesPizzaAndMacaroni1";
  let cmd = `(k,${network},${pwd})`;
  doodlebot.sendCommandToRobot(cmd);
  // .then(()=>{sendCommandToRobot()})
});
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

async function onForgetBluetoothDeviceButtonClick() {
  try {
    const devices = await navigator.bluetooth.getDevices();

    const deviceIdToForget = document.querySelector("#devicesSelect").value;
    const device = devices.find((device) => device.id == deviceIdToForget);
    if (!device) {
      throw new Error("No Bluetooth device to forget");
    }
    log("Forgetting " + device.name + "Bluetooth device...");
    await device.forget();

    log("  > Bluetooth device has been forgotten.");
    populateBluetoothDevices();
  } catch (error) {
    log("Argh! " + error);
  }
}
