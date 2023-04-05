// Variables for video and canvas
let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

// Variables for yellow color range
let hsvMin, hsvMax;


// Variables for morphological operations
let morphKernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(5, 5));


// Function to start video streaming and object tracking
function startVideo() {
  // Get user media to access the camera
  navigator.mediaDevices.getUserMedia({video: true})
    .then((stream) => {
      video.srcObject = stream;
      video.play();
      // Start tracking objects
      requestAnimationFrame(trackObjects);
    })
    .catch((err) => {
      console.log('Error: ' + err);
    });
}

// Function to track yellow objects in real-time
function trackObjects() {
    if (!hsvMin || !hsvMax) {
        return;
    }
  // Capture a frame from the video stream
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  let src = cv.imread(canvas);

  // Convert the image to HSV color space
  let hsv = new cv.Mat();
  cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
  cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

  // Threshold the image to extract yellow objects
  let mask = new cv.Mat();
  cv.inRange(hsv, hsvMin, hsvMax, mask);

  // Apply morphological operations to the mask
  cv.morphologyEx(mask, mask, cv.MORPH_OPEN, morphKernel);

  // Find contours in the mask
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  // Draw bounding boxes around the yellow objects
  for (let i = 0; i < contours.size(); i++) {
    let rect = cv.boundingRect(contours.get(i));
    cv.rectangle(src, rect, new cv.Scalar(0, 255, 0), 2);
  }

  // Show the result on the canvas
  cv.imshow(canvas, src);

  // Free memory
  src.delete();
  hsv.delete();
  mask.delete();
  contours.delete();
  hierarchy.delete();

  // Request the next frame
  requestAnimationFrame(trackObjects);
}

// Function to run when OpenCV.js is ready to use
function onOpenCvReady() {
    console.log(cv);
  // Update status message
  document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
    // hsvMin = new cv.Scalar(20, 100, 100);
    // hsvMax = new cv.Scalar(30, 255, 255);
     hsvMin = new cv.Mat(4, 1, cv.CV_64F, [20, 100, 100, 0]);
     hsvMax = new cv.Mat(4, 1, cv.CV_64F, [30, 255, 255, 255]);
    // morphKernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(5, 5));

  // Start video streaming and object tracking
  startVideo();
}
