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
cd virtual-board/grid.js
python3 -m http.server
```

Python serves the frontend in `http://localhost:8000`. If, for some reason, you want to serve it in a different port, you can do `python3 -m http.server 8001`.

## Documentation
See it on [the documentation page](./documentation.md)

## Troubleshoot

### I pressed "Activate Camera" and see my own webcam, not the one that I connected!

So far the only workaround I've found is to explicitely set the camera's `deviceId` on [the camera constraints](./marker_detector/constants.js). To find the `deviceId` you need to open the console (on a window where you've granted Camera access) and run 

```javascript
(await navigator.mediaDevices.enumerateDevices()).filter(x => x.kind === "videoinput")
```