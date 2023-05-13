// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

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
  databaseUrl:
    "https://doodlebot-controller-firebase-default-rtdb.firebaseio.com",
};
let userId;
let db;
let roomsRef;
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  // const analytics = getAnalytics(app);

  // initialize database
  db = getDatabase(app);

  const auth = getAuth();
  signInAnonymously(auth);
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      console.log("User is signed in");
      const uid = user.uid;
      userId = user.uid;
      window.userId = userId;
    }
  });
});
class RealtimeUpdates {
  constructor() {}
  activate_camera() {
    socket.emit("activate_camera", {});
  }
  /*--------   Room handlers ------- */

  create_room(data) {
    //empty
    // socket.emit("create_room", data);
    // let room_key = push(roomsRef).key;
    // console.log(room_key);
    let room_key = push(ref(db, "rooms/")).key;
    set(ref(db, `rooms/${room_key}`), {
      num_users: 0,
      users: [userId],
    });
    roomIdBold.innerHTML =
      "<strong style='color:black;'>Your room ID is: " + room_key + "</strong>";
  }
  join_room(data) {
    //roomId
    socket.emit("join_room", data);
  }
  join_room_page(data) {
    //roomId
    socket.emit("join_room_page", data);
  }

  /*--------   Add objects ------- */

  add_bot(data) {
    //bot, virtualGrid
    socket.emit("add_bot", data);
  }
  add_obstacle(data) {
    //obstacle, virtualGrid
    socket.emit("add_obstacle", data);
  }
  add_coin(data) {
    //coin, virtualGrid
    socket.emit("add_coin", data);
  }

  /*--------   Replace objects ------- */

  replace_bot(data) {
    //bot_id, bot, virtualGrid
    socket.emit("replace_bot", data);
  }
  replace_obstacle(data) {
    //obstacle_id, obstacle, virtualGrid
    socket.emit("replace_obstacle", data);
  }
  replace_coin(data) {
    //coin_id, coin, virtualGrid
    socket.emit("replace_coin", data);
  }

  /*--------   Remove  objects ------- */

  remove_bot(data) {
    //bot, virtualGrid
    socket.emit("remove_bot", data);
  }
  remove_obstacle(data) {
    // obstacle, virtualGrid
    socket.emit("remove_obstacle", data);
  }
  remove_coin(data) {
    //coin, virtualGrid
    socket.emit("remove_coin", data);
  }

  /*--------   Tutorial handlers ------- */

  choose_theme(data) {
    //option (None, City,..), mode (virtual vs camera), roomId
    socket.emit("choose_theme", data);
  }

  finish_page(data) {
    //roomId, page
    socket.emit("finish_page", data);
  }

  /*--------   Game handlers ------- */

  replace_bot_ready_to_start(data) {
    //bot, virtualGrid
    socket.emit("replace_bot_ready_to_start", data);
  }
  everyone_ready_to_start(data) {
    //{}
    socket.emit("everyone_ready_to_start", data);
  }
  stop_moving(data) {
    //{}
    socket.emit("stop_moving", data);
  }
  change_require_graph(data) {
    //bot_id, require_graph
    socket.emit("change_require_graph", data);
  }
}

let live_updates = new RealtimeUpdates();
window.live_updates = live_updates;
// db.ref("rooms").push("aaaaa");
// set(ref(db, "rooms/test-"), {
//   username: "Raul",
//   email: "ktimporta",
//   profile_picture: "xd",
// });

// export { live_updates };
