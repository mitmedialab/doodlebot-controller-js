let doodlebot;
let server;
let services;
// let characteristic;
let myDescriptor;
SERVICE_UART_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
CHARACTERISTIC_UART_UUID_RX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
CHARACTERISTIC_UART_UUID_TX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
all_characteristics = {};

class Doodlebot {}

async function sendCommandToRobot(commands, delayInMs = 500) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (doodlebot) {
        log("Sending command: " + commands);
        // doodlebot.sendText(command);
        if (!all_characteristics) {
          log("Uh oh...trying to send commands but hasn't initialized yet!");
          return;
        }
        let characteristic = all_characteristics["RX"];
        //send command to doodlebot
        let encoder = new TextEncoder("utf-8");
        log("Changing characteristic...");
        const arrayData = commands.split("").map((e) => e.charCodeAt(0));
        log("ArrayData");
        log(arrayData);
        let value = new Uint8Array(arrayData).buffer;
        // await characteristic.writeValueWithoutResponse(value);
        let res = characteristic.writeValueWithResponse(value);
      } else console.log("Robot not available");
      resolve();
    }, delayInMs);
  });
}
function log(message) {
  logBox.value = message + "\n" + logBox.value;
}
function time(text) {
  log("[" + new Date().toJSON().substr(11, 8) + "] " + text);
}
sendCommandButton.addEventListener("click", async function () {
  let commands = botCommand.value;
  sendCommandToRobot(commands);
});
connectInternetButton.addEventListener("click", async function () {
  let network = "PRG-MIT";
  let pwd = "JiboLovesPizzaAndMacaroni1";
  let cmd = `(k,${network},${pwd})`;
  sendCommandToRobot(cmd);
  // .then(()=>{sendCommandToRobot()})
});
async function populateBluetoothDevices() {
  const devicesSelect = document.querySelector("#devicesSelect");
  try {
    log("Getting existing permitted Bluetooth devices...");
    const devices = await navigator.bluetooth.getDevices();

    log("> Got " + devices.length + " Bluetooth devices.");
    devicesSelect.textContent = "";
    for (const device of devices) {
      doodlebot = device;
      doodlebot.addEventListener("gattserverdisconnected", onDisconnected);
      connect();

      const option = document.createElement("option");
      option.value = device.id;
      option.textContent = device.name;
      devicesSelect.appendChild(option);
    }
  } catch (error) {
    log("Argh! " + error);
  }
}
function connect() {
  exponentialBackoff(
    3 /* max retries */,
    2 /* seconds delay */,
    async function toTry() {
      time("Connecting to Bluetooth Device... ");
      log("Connecting to GATT Server...");
      server = await doodlebot.gatt.connect();
      log("Getting service...");
      // could be right
      service = await server.getPrimaryService(SERVICE_UART_UUID);
      // const services = await doodlebot.gatt.getPrimaryServices();
      // log(`Found ${services.length} services`);
      // service = services.find((service) => service.uuid === SERVICE_UART_UUID);

      log(service.uuid);

      log("Getting characteristic...");
      //could work
      all_characteristics["RX"] = await service.getCharacteristic(
        CHARACTERISTIC_UART_UUID_RX
      );
      all_characteristics["TX"] = await service.getCharacteristic(
        CHARACTERISTIC_UART_UUID_TX
      );

      // const characteristics = await service.getCharacteristics();
      // log(`Found ${characteristics.length} characteristics`);
      // for (let i = 0; i < characteristics.length; i++) {
      //   log(`${i}th = ${characteristics[i].uuid}`);
      // }
      // characteristic = characteristics.find(
      //   (characteristic) => characteristic.uuid === CHARACTERISTIC_UART_UUID_RX
      // );

      // For receiving messages
      await all_characteristics["TX"].startNotifications();

      all_characteristics["TX"].addEventListener(
        "characteristicvaluechanged",
        (evt) => {
          const view = evt.target.value;
          // const value = new Uint8Array(view.buffer);
          // this.dispatchEvent("receive", value);
          log("Received:");
          log(view);
          var enc = new TextDecoder("utf-8"); // always utf-8
          log(enc.decode(view.buffer));
        }
      );
      // );
      //   log("Getting descriptor...");
      //   myDescriptor = await characteristic.getDescriptor(
      // "gatt.characteristic_user_description"
      //   );
      log("Connected succesfully!");
      return server;
    },
    function success() {
      log("> Bluetooth Device connected. Try disconnect it now.");
    },
    function fail() {
      time("Failed to reconnect.");
    }
  );
}
function onDisconnected() {
  log("> Bluetooth Device disconnected");
  connect();
}
// This function keeps calling "toTry" until promise resolves or has
// retried "max" number of times. First retry has a delay of "delay" seconds.
// "success" is called upon success.
function exponentialBackoff(max, delay, toTry, success, fail) {
  toTry()
    .then((result) => success(result))
    .catch((_) => {
      log(_);
      if (max === 0) {
        return fail();
      }
      time("Retrying in " + delay + "s... (" + max + " tries left)");
      setTimeout(function () {
        exponentialBackoff(--max, delay * 2, toTry, success, fail);
      }, delay * 1000);
    });
}
async function onRequestBluetoothDeviceButtonClick() {
  try {
    log("Requesting any Bluetooth device...");
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ name: "Doodlebot Frida" }, { services: [SERVICE_UART_UUID] }], // <- Prefer filters to save energy & show relevant devices.
      //   acceptAllDevices: true,
    });

    log("> Requested " + device.name + " (" + device.id + ")");
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

window.onload = () => {
  populateBluetoothDevices();
};
