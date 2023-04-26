/**
 * In this file there are the methods for the physical version of the Doodlebot UI.
 *
 * Most important methods are to:
 *  1) Handle Bluetooth connections with the Doodlebots.
 *  2) Handle connecting to the physical camera.
 */
//--------------------------------Logging stuff------------------------------------------------//

function log(message) {
  logBox.value = message + "\n" + logBox.value;
}

//-------------------------------Bluetooth handlers-----------------------------------------------//

import { Doodlebot } from "./doodlebot_control/doodlebot.js";

let currentDoodlebot; //Current Doodlebot object that has been connected to the device through Bluetooth
let allDoodlebots = {}; // Doodlebot name -> doodlebot object for control the REAl doodlebots

async function onRequestBluetoothDeviceButtonClick() {
  try {
    let newDoodlebot = new Doodlebot(log);
    await newDoodlebot.request_device();
    //TODO: Make sure it's okay not having `populateBluetoothDevices` method is fine
    log("Trying to connect...");
    await newDoodlebot.connect();
    let { id, name } = newDoodlebot.bot;
    currentDoodlebot = newDoodlebot;
    console.log(`Added id with ${id} and name ${name}`);
    log(`Added id with ${id} and name ${name}`);
    bluetooth_button.innerText = `Connected to ${name}!`;

    // allDoodlebots[newDoodlebot.bot.id] = newDoodlebot; // Saving object
    allDoodlebots[name] = newDoodlebot; // This might not be necessary as it'll be 1 per laptop

    //TODO: Make sure you can only connect to one device at a time
    const devicesSelect = document.querySelector("#devicesSelect");
    const option = document.createElement("option");
    option.value = newDoodlebot.bot.id;
    option.textContent = newDoodlebot.bot.name;
    devicesSelect.appendChild(option);
  } catch (error) {
    log("Problem connecting to Bluetooth: " + error);
  }
}

bluetooth_button.addEventListener("click", async (evt) => {
  await onRequestBluetoothDeviceButtonClick();
});
//-------------------------------Camera handlers-----------------------------------------------//
