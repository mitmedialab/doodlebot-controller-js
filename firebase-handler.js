// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBRH2pjJ0q7QscoMP3QOziUkezxCoBeI-8",
  authDomain: "doodlebot-controller-firebase.firebaseapp.com",
  projectId: "doodlebot-controller-firebase",
  storageBucket: "doodlebot-controller-firebase.appspot.com",
  messagingSenderId: "809937611671",
  appId: "1:809937611671:web:1e0867dfd80d59ed8472d2",
  measurementId: "G-YL98PYV0BD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
