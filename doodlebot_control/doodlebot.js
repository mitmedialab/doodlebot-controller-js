class UartService {
  static get uuid() {
    //For service
    return "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
  }

  static get rx_uuid() {
    //For characteristic sending commands
    return "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
  }

  static get tx_uuid() {
    //For characteristic receiving commands
    return "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
  }
}
const PEN_DIRECTION_TO_ANGLE = {
  down: 10,
  up: 35,
};
class CustomEventTarget extends EventTarget {
  constructor() {
    super();
  }
}
// This function keeps calling "toTry" until promise resolves or has
// retried "max" number of times. First retry has a delay of "delay" seconds.
// "success" is called upon success.
function exponentialBackoff(max, delay, toTry, success, fail) {
  toTry()
    .then((result) => success(result))
    .catch((_) => {
      console.log(_);
      if (max === 0) {
        return fail();
      }
      console.log("Retrying in " + delay + "s... (" + max + " tries left)");
      setTimeout(function () {
        exponentialBackoff(--max, delay * 2, toTry, success, fail);
      }, delay * 1000);
    });
}

import { PromiseQueue } from "./promise-queue.js";

class Doodlebot {
  constructor(log = (msg) => {}, customOnReceiveValue = (evt) => {}) {
    /**
     * Bluetooth variables
     */
    this.bot = null;
    this.server = null;
    this.service = null;
    this.all_characteristics = {};
    this.isMoving = false;

    this.log = log;
    this.customOnReceiveValue = customOnReceiveValue;
    this.commands_queue = new PromiseQueue();

    this.motorEvent = new CustomEventTarget();
  }
  async request_device() {
    this.log("Requesting any Bluetooth device...");
    // const device = RobotBLE.requestRobot(bluetooth, "Doodlebooth Frida");
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [UartService.uuid] }], // <- Prefer filters to save energy & show relevant devices.
      //   acceptAllDevices: true,
    });

    this.log("> Requested " + device.name + " (" + device.id + ")");

    this.bot = device;
    this.bot.addEventListener(
      "gattserverdisconnected",
      this.onDisconnected.bind(this)
    );
  }
  async setup_services() {
    if (!this.bot) {
      this.log("Trying to setup a bot that has not been initialized.");
      return;
    }
    this.log("Connecting to GATT Server...");
    this.server = await this.bot.gatt.connect();
    this.log("Getting service...");
    // could be right
    this.service = await this.server.getPrimaryService(UartService.uuid);

    this.log("Getting characteristic...");
    //could work
    this.all_characteristics["RX"] = await this.service.getCharacteristic(
      UartService.rx_uuid
    );
    this.all_characteristics["TX"] = await this.service.getCharacteristic(
      UartService.tx_uuid
    );

    // For receiving messages
    await this.all_characteristics["TX"].startNotifications();

    this.all_characteristics["TX"].addEventListener(
      "characteristicvaluechanged",
      this.onReceiveValue.bind(this)
    );
    this.log("Connected succesfully!");
    return this.server;
  }
  connect() {
    let that = this;
    exponentialBackoff(
      3 /* max retries */,
      2 /* seconds delay */,
      this.setup_services.bind(this),
      function success() {
        that.log("> Bluetooth Device connected. Try disconnect it now.");
      },
      function fail() {
        that.log("Failed to reconnect.");
      }
    );
  }
  onDisconnected() {
    this.log("> Bluetooth Device disconnected");
    this.connect();
  }
  onReceiveValue(evt) {
    let enc = new TextDecoder("utf-8"); // always utf-8
    let res = enc.decode(evt.target.value.buffer);
    if (res === "(ms)") {
      this.log("Stopped moving...");
      let stopEvent = new CustomEvent("stop", {});
      this.motorEvent.dispatchEvent(stopEvent);
      this.isMoving = false;
    }
    this.log(res);
    this.customOnReceiveValue(evt);
  }
  /**
   *
   * @param {*} move ['move', x] where x > 0, or ['turn', angle]
   * @returns
   */
  async apply_next_move_to_bot(move) {
    console.log(`Tyring to apply move ${move} to (real) bot`);
    // let GRID_TO_PHYSICAL_COORDS = 227 / 8;
    let GRID_TO_PHYSICAL_COORDS = 18;
    /**
     * From empirical data:
     * Sending command this.drive({NUM: 28}) makes it move 5mm
     *
     * Grid: 64mm -> 20 cells
     *
     * (28 units/ 5mm) * (64mm / 20 cells) = 18 units / cell
     */
    if (move[0] === "move") {
      await this.drive({ NUM: move[1] * GRID_TO_PHYSICAL_COORDS });
      return;
    } else if (move[0] === "turn") {
      let angle = move[1] % 360;
      if (angle < 0) {
        angle += 360;
      }
      if (angle <= 180) {
        await this.turn({ NUM: angle, DIR: "left" });
      } else {
        await this.turn({ NUM: 360 - angle, DIR: "right" });
      }
      return;
    } else {
      console.log(
        `Incorrect move. Should start with "move" or "turn" but started with ${move[0]}`
      );
      return null;
    }
  }
  // async init() {
  //   // First add this to the bluetooth device list
  //   await this.request_device();
  //   await this.connect();
  // }
  async drive(args) {
    if (this.isMoving) {
      console.log("[Driving] It cannot be moving while already moving");
      return;
    }
    this.isMoving = true;
    let { NUM, DIR } = args;
    NUM = Math.round(NUM); //Gotta be an integer
    //For left and right motor
    let leftSteps = NUM;
    let rightSteps = NUM;
    if (DIR === "left" || DIR === "backward") {
      leftSteps *= -1;
    }
    if (DIR === "right" || DIR === "backward") {
      rightSteps *= -1;
    }
    await this.sendCommandToRobot(`(m,100,100,${leftSteps},${rightSteps})`);

    // this.isMoving = false;
    return new Promise((resolve) => {
      this.motorEvent.addEventListener(
        "stop",
        () => {
          resolve();
        },
        { once: true }
      );
    });
  }
  async turn(args) {
    if (this.isMoving) {
      console.log("[turning] It cannot be moving while already moving");
      return;
    }
    this.isMoving = true;
    let { NUM, DIR } = args;
    NUM = Math.round(NUM);
    let nDegrees = NUM;
    if (DIR === "right") {
      nDegrees *= -1;
    }
    this.log(`Trying to turn ${nDegrees}`);
    await this.sendCommandToRobot(`(t,0,${nDegrees})`);

    return new Promise((resolve) => {
      this.motorEvent.addEventListener(
        "stop",
        () => {
          resolve();
        },
        { once: true }
      );
    });
  }
  async movePen(args) {
    let { DIR } = args;
    let angle = PEN_DIRECTION_TO_ANGLE[DIR];
    await this.sendCommandToRobot(`(u,${angle})`);
  }
  /**
   * Users should not call this function, but rather the function-specific methods
   * like this.drive(), this.turn()
   * @param {*} commands
   * @param {*} delayInMs
   * @returns
   */
  async sendCommandToRobot(commands) {
    let delayInMs = 100;
    return new Promise((resolve) => {
      setTimeout(async () => {
        if (this.bot) {
          this.log("Sending command: " + commands);
          if (!this.all_characteristics) {
            this.log(
              "Uh oh...trying to send commands but hasn't initialized yet!"
            );
            return;
          }
          let characteristic = this.all_characteristics["RX"];

          //send command to doodlebot
          this.log("Changing characteristic...");
          const arrayData = commands.split("").map((e) => e.charCodeAt(0));
          this.log("ArrayData");
          this.log(arrayData);
          let value = new Uint8Array(arrayData).buffer;
          await this.commands_queue.add(async () =>
            characteristic.writeValueWithoutResponse(value)
          );
          // await characteristic.writeValueWithoutResponse(value);
          // let res = characteristic.writeValueWithResponse(value);
        } else this.log("Robot not available");
        resolve();
      }, delayInMs);
    });
  }
  async connectToWifi(network, pwd) {
    let cmd = `(k,${network},${pwd})`;
    return sendCommandToRobot(cmd);
  }
}
// module.exports = Doodlebot;
export { Doodlebot };
