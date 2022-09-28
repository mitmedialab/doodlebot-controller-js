import numpy as np
import cv2 as cv
import time  
import glob
import json
# termination criteria
criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)
# prepare object points, like (0,0,0), (1,0,0), (2,0,0) ....,(6,5,0)
w, h = 7, 7
print("w, h:", w, h)
objp = np.zeros((w*h,3), np.float32)
objp[:,:2] = np.mgrid[0:w,0:h].T.reshape(-1,2)
# Arrays to store object points and image points from all the images.
objpoints = [] # 3d point in real world space
imgpoints = [] # 2d points in image plane.
images = glob.glob('images/*.jpg')
for fname in images:
    img = cv.imread(fname)
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    # Find the chess board corners
    ret, corners = cv.findChessboardCorners(gray, (w,h), None)
    # If found, add object points, image points (after refining them)
    if ret == True:
        objpoints.append(objp)
        corners2 = cv.cornerSubPix(gray,corners, (11,11), (-1,-1), criteria)
        imgpoints.append(corners)
        # Draw and display the corners
        cv.drawChessboardCorners(img, (w,h), corners2, ret)
        cv.imshow('img', img)
        # time.sleep(2)
        cv.waitKey(1000)
        # cv.waitKey(1000)
    else:
        print("Oops..")

ret, mtx, dist, rvecs, tvecs = cv.calibrateCamera(objpoints, imgpoints, gray.shape[::-1], None, None)
print(ret, mtx, dist, rvecs, tvecs)
print("Writing to json:")
params = {
    "ret": ret,
    "matrix": mtx.tolist(),
    "dist": dist.tolist(),
    # "rvecs": rvecs,
    # "tvecs": tvecs
}

with open("./camera_calib.json", "w+") as out:
    json.dump(params, out, indent=4)
cv.destroyAllWindows()