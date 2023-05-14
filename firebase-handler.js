// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  update,
  get,
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
let PAGE_ORDER = [
  "tutorial1",
  "game1",
  "tutorial2",
  "game2",
  "tutorial3",
  "game3",
  "tutorial4",
  "game4",
  "tutorial5",
  "final_game",
];
const getNextPage = (page) => {
  let idx = PAGE_ORDER.indexOf(page);
  if (idx === -1) {
    console.error(
      `Careful! The page ${page} is not a valid page from PAGE_ORDER`
    );
  }
  let next_page = PAGE_ORDER[idx + 1];
  let is_game = next_page.startsWith("game");
  return { is_game, next_page };
};
/**
 * A game will have the following structure
 * <room_name>:
 *     num_users: count
 *
 */
let userId;
let db;
let roomsRef;
let live_updates;
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
      live_updates = new RealtimeUpdates();
      window.live_updates = live_updates;

      var urlParams = new URLSearchParams(window.location.search);
      let roomId = urlParams.get("room");
      let is_tutor = urlParams.get("is_tutor") === "true";
      let path = window.location.pathname;
      let html_page = path.split("/").pop().split(".").pop();

      live_updates.join_room_page({ roomId, is_tutor, html_page: html_page });
    }
  });
});
/**
 * Listeners:
 *
 * /<room_name>/num_users -> To keep track of the number of users logged in
 *
 */
let GAME_TO_THEME = {
  game1: "None",
  game2: "School",
  game3: "City",
  game4: "Pacman",
};
class RealtimeUpdates {
  constructor() {
    this.roomRef = null;
    this.usersRef = null;
    this.numUsersRef = null;
    this.pages_ref = {};
    this.users_done_ref = {};

    this.room_info = {
      min_users_to_move: 3, //kid 1 + kid2 + teacher
      users: {},
      seen_tutorial: false,
      tutorial1: {
        //page0 is tutorial.html
        users_done: {},
        min_users_to_move: 2,
      },
      tutorial2: {
        //page1 is game1.html
        users_done: {},
        min_users_to_move: 2,
      },
      tutorial3: {
        //page2 is tutorial2.html
        users_done: {},
        min_users_to_move: 2,
      },
      tutorial4: {
        //page3 is game2.html
        users_done: {},
        min_users_to_move: 2,
      },
      tutorial5: {
        //page3 is tutorial3.html
        users_done: {},
        min_users_to_move: 2,
      },
      game1: {
        users_done: {},
        min_users_to_move: 2,
      },
      game2: {
        users_done: {},
        min_users_to_move: 2,
      },
      game3: {
        users_done: {},
        min_users_to_move: 2,
      },
      game4: {
        users_done: {},
        min_users_to_move: 2,
      },
    };
  }
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
    set(ref(db, `rooms/${room_key}`), this.room_info);
    roomIdBold.innerHTML =
      "<strong style='color:black;'>Your room ID is: " + room_key + "</strong>";
    this.join_room_page({
      roomId: room_key,
      is_tutor: true,
      html_page: "rooms",
    });
  }
  join_room(data) {
    //roomId
    // socket.emit("join_room", data);
  }
  async join_room_page(data) {
    let { roomId, is_tutor, html_page } = data;
    is_tutor = is_tutor ? true : false;
    this.is_tutor = is_tutor;
    this.html_page = html_page;
    this.current_room = roomId;

    //Just listen for updates on the room page
    this.roomRef = ref(db, `rooms/${this.current_room}`);
    this.usersRef = ref(db, `rooms/${this.current_room}/users`);

    let prev = await get(this.roomRef); //Retrieving latest state
    this.room_info = prev.val();
    if (!this.room_info) {
      console.log(`Room ${this.current_room} doesn't exist.`);
      //TODO: Should we create the room here?
    }
    console.log(`Read from database: ${this.num_users}`);
    onValue(this.usersRef, (snapshot) => {
      console.log(`Found an update for users:`);
      let new_users = snapshot.val() || {};
      console.log(new_users);
      this.room_info.users = new_users;
      if (
        this.html_page === "rooms" &&
        Object.keys(new_users).length === this.room_info.min_users_to_move
      ) {
        if (is_tutor) {
          window.location.href = `tutorial.html?room=${this.current_room}&is_tutor=true`;
        } else {
          window.location.href = `tutorial.html?room=${this.current_room}`;
        }
      }
    });
    for (let page of PAGE_ORDER) {
      if (page === "final_game") {
        continue;
      }
      let pageRef = ref(db, `rooms/${this.current_room}/${page}`);
      let usersDoneRef = ref(
        db,
        `rooms/${this.current_room}/${page}/users_done`
      );
      this.users_done_ref[page] = usersDoneRef;
      onValue(usersDoneRef, (snapshot) => {
        let new_users = snapshot.val() || {};
        this.room_info[page].users_done = new_users;
        if (
          Object.keys(new_users).length ===
          this.room_info[page].min_users_to_move
        ) {
          this.move_to_next_page(page);
        }
      });
    }
    console.log({
      [userId]: { is_tutor },
    });
    update(this.usersRef, {
      [userId]: { is_tutor },
    });
  }
  update_url_if_tutor(url) {
    if (!this.isTutor()) {
      return url;
    } else {
      return url + "&is_tutor=true";
    }
  }
  /**
   * Should only be
   * @returns
   */
  get_bot_id_tutorial() {
    let all_users = this.room_info.users;
    let students = [...Object.keys(all_users)].filter(
      (x) => !all_users[x].is_tutor
    );
    students.sort();
    let idx = students.indexOf(userId);
    if (idx === -1) {
      console.error(`The user ${userId} is not in the list of students!`);
      console.error(students);
      return;
    }
    return idx + 1; // So that it's 1-index
  }
  move_to_next_page(curr_page) {
    let { next_page, is_game } = getNextPage(curr_page);
    if (next_page === "final_game") {
      window.location.href = this.update_url_if_tutor(
        `index.html?room=${this.current_room}`
      );
      return;
    }
    if (is_game) {
      let theme = GAME_TO_THEME[next_page];
      let main_url = `virtualMode.html?option=${theme}&mode=virtual&room=${this.current_room}&tutorial=${next_page}`;
      if (this.is_tutor) {
        window.location.href = `${main_url}&is_tutor=true`;
      } else {
        window.location.href = `${main_url}&bot_id=${this.get_bot_id_tutorial()}`;
      }
    } else {
      window.location.href = this.update_url_if_tutor(
        `${next_page}.html?room=${this.current_room}`
      );
    }
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
    let { page } = data;
    console.log(page);
    console.log(userId);
    // socket.emit("finish_page", data);
    update(this.users_done_ref[page], {
      [userId]: true,
    });
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
// db.ref("rooms").push("aaaaa");
// set(ref(db, "rooms/test-"), {
//   username: "Raul",
//   email: "ktimporta",
//   profile_picture: "xd",
// });

// export { live_updates };
