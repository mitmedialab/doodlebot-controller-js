# Doodlebot Collaboration/Competition UI
## Get Started
Clone the repository

```bash
git clone https://github.com/mitmedialab/doodlebot-controller-js
cd doodlebot-controller-js/
```
## Get running
For both of the below cases, the backend should be running. To do this, you can open a new terminal and
```
cd game-server/
npm run dev
```
If it's the first time, don't forget to run `npm install` first. As of now, the backend runs in `http://localhost:4000`.

To run the frontend:

### 1. Version with real bots
First you'll have to connect a camera to your computer
```bash
python3 -m http.server
```
### 2. Fully virtual version
```bash
cd virtual-board/
python3 -m http.server
```

Python serves the frontend in `http://localhost:8000`. If, for some reason, you want to serve it in a different port, you can do `python3 -m http.server 8001`.

## Folder structure
As of now, there are several folders, some with different purposes and others with no purpose but just me testing stuff. As that description is probably not useful, here's a more detailed explanation:


| Folder name | Description | Important? | 
| ---- | -------- | -------- | 
| [virtual-board](./virtual-board/)| This is the core of this project. This provides [virtual-board/grid.js](./virtual-board/grid.js) which handles the creationg/deletion and update of bots/obstacles/coins. For more details, you can check out its [documentation](#documentation). Apart from this, the folder also provides [graph.js](./virtual-board/graph.js) with general code to find shortest path on a Graph using Dijkstra; and [grid-graph.js](./virtual-board/grid-graph.js) which provides `VirtualGrid`-specific methods to find the shortest way for a bot to go to a given object (i.e., a coin). | **YES**|
| [game-server](./game-server/)| The [game-server.js](./game-server/game-server.js) file serves the socket connection between different clients as means of staying synchronized. It basically makes it so that when an object is created/updated/deleted in one client, this also happens on the other client. | Yes|
| [marker_detector](./marker_detector/)| It contains the code necessary to manage the data that comes from the camera stream. Most important files are [camera-controller.js](./marker_detector/camera-controller.js) which provides the `CameraController` class to find Aruco codes and detect a given color on an image; [constants.js](./marker_detector/constants.js) with camera-specific values; and [opencv_compiled.js](./marker_detector/opencv_compiled.js) which is a compiled version of Opencv JS. I had to [compile it myself](https://docs.opencv.org/3.4/d4/da1/tutorial_js_setup.html) because the one provided by OpenCv doesn't have the `opencv-contrib` which is the part that has the Aruco detection. | Not too much, only changing the `deviceId` on [constants.js](./marker_detector/constants.js) for [correct camera detection](#i-pressed-activate-camera-and-see-my-own-webcam-not-the-one-that-i-connected).  |
| [doodlebot_control](./doodlebot_control/)| Initial test of connecting the (real) doodlebots to the browser using Bluetooth. The [doodlebot_control/doodlebot.js](./doodlebot_control/doodlebot.js) provides the `Doodlebot` class, which is used in the final physical version of the game. A lot of this was taken from Randi's [scratch3_doodlebot repo](https://github.com/mitmedialab/prg-extension-boilerplate/tree/robotdev/packages/scratch-vm/src/extensions/scratch3_doodlebot)| Very little, as I don't think much (if anything) has to change. |
| [arucogen](./arucogen/) | A clone of a [PR](https://github.com/vwvw/arucogen) from [arucogen](https://chev.me/arucogen/) that allows for printing colored aruco codes (main website doesn't). Tried this to see if detection was good, and sadly it isn't| No | 
| [camera_calibration](./camera_calibration/)| An attempt to calibrate the camera I use (and get a `cameraMatrix` and `distCoeffs`). Ultimately didn't show great promise | No |
| [color-detection](./color-detection/)| Playground to test color detection using OpenCV. Not important now as most of my findings got written into the `filterColor` method in [camera-controller](./marker_detector/camera-controller.js)| No |
| [server](./server/)| A server I created when I thought I'd let students train their own ML model. This server acted as a way to store training data. Not used anymore.  | No|
| [virtual-board-training](./virtual-board-training/)| UI connected to [the previous server](./server/) that sent information to gather training data. Not used anymore | No  |
| [workers](./workers/)| Playground when I was checking out how [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) worked. My reasoning was that I wanted two different threads to control different bots, so that they act independently. This never worked as `WebWorker`s have limited functionality and currently they [don't support Bluetooth connections](https://github.com/WebBluetoothCG/web-bluetooth/issues/422). They also have limited types of data they can send from the main thread (as it always have to be copied). | No |


## VirtualGrid Documentation
See it on [the documentation page](./virtual-grid-documentation.md)

## Troubleshoot

### I pressed "Activate Camera" and see my own webcam, not the one that I connected!

So far the only workaround I've found is to explicitely set the camera's `deviceId` on [the camera constraints](./marker_detector/constants.js). To find the `deviceId` you need to open the console (on a window where you've granted Camera access) and run 

```javascript
(await navigator.mediaDevices.enumerateDevices()).filter(x => x.kind === "videoinput")
```