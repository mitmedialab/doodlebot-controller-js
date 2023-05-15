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
  onChildAdded,
  onChildRemoved,
  remove,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { generateName } from "./name.js";

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
const is_game_page = (page) => {
  let is_game = page.startsWith("game") || page === "final_game";
  return is_game;
};
const getNextPage = (page) => {
  let idx = PAGE_ORDER.indexOf(page);
  if (idx === -1) {
    console.error(
      `Careful! The page ${page} is not a valid page from PAGE_ORDER`
    );
  }
  let next_page = PAGE_ORDER[idx + 1];
  let is_game = is_game_page(next_page);
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
window.live_updates;
document.addEventListener("DOMContentLoaded", () => {
  console.log("Firirent from firebase handler");
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  // const analytics = getAnalytics(app);

  // initialize database
  db = getDatabase(app);

  const auth = getAuth();
  signInAnonymously(auth);
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      console.log("User is signed in");
      var urlParams = new URLSearchParams(window.location.search);
      let roomId = urlParams.get("room");
      let is_tutor = urlParams.get("is_tutor") === "true";
      let tutorial = urlParams.get("tutorial");
      let path = window.location.pathname;
      let html_page = path.split("/").pop().split(".")[0];
      const uid = user.uid;
      userId = user.uid;
      window.userId = userId;
      live_updates = new RealtimeUpdates();
      window.live_updates = live_updates;

      let curr_page;
      // This means is a tutorial game
      if (html_page === "virtualMode" || html_page === "index") {
        if (tutorial) {
          curr_page = tutorial;
        } else {
          curr_page = "final_game";
        }
      } else {
        curr_page = html_page;
      }
      if (roomId) {
        await live_updates.join_room_page({
          roomId,
          is_tutor,
          curr_page,
          html_page,
        });
      }
      if (window.onConnectionSetup) {
        onConnectionSetup();
      }
    }
  });
});
/**
 * Listeners:
 *
 * /<room_name>/num_users -> To keep track of the number of users logged in
 *
 * /<room_name>/grid/
 * /<room_name>/grid/
 */
let GAME_TO_THEME = {
  game1: "None",
  game2: "School",
  game3: "City",
  game4: "Pacman",
};
let DEFAULT_ROOM_INFO = {
  min_users_to_move: 3, //kid 1 + kid2 + teacher
  users: {},
  seen_tutorial: false,
  tutorial1: {
    //page0 is tutorial1.html
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
    started: {},
    grid: {
      bots: {},
      obstacles: {},
      coins: {},
    },
  },
  game2: {
    users_done: {},
    min_users_to_move: 2,
    started: {},
    grid: {
      bots: {},
      obstacles: {},
      coins: {},
    },
  },
  game3: {
    users_done: {},
    min_users_to_move: 2,
    started: {},
    grid: {
      bots: {},
      obstacles: {},
      coins: {},
    },
  },
  game4: {
    users_done: {},
    min_users_to_move: 2,
    started: {},
    grid: {
      bots: {},
      obstacles: {},
      coins: {},
    },
  },
  final_game: {
    min_users_to_move: 2,
    started: {},
    grid: {
      bots: {},
      obstacles: {},
      coins: {},
      options: {
        theme: "", //None, City, School or Pacman
        mode: "", //virtual or camera
      },
    },
  },
};
class RealtimeUpdates {
  constructor() {
    this.roomRef = null;
    this.usersRef = null;
    this.numUsersRef = null;
    this.startedGameRef = null;
    this.pages_ref = {};
    this.users_done_ref = {};
    this.bot_refs = {
      game1: {},
      game2: {},
      game3: {},
      game4: {},
      final_game: {},
    };
    this.obstacle_refs = {
      game1: {},
      game2: {},
      game3: {},
      game4: {},
      final_game: {},
    };
    this.coin_refs = {
      game1: {},
      game2: {},
      game3: {},
      game4: {
        require_graph: {},
      },
      final_game: {},
    };
    this.room_info = DEFAULT_ROOM_INFO;
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
    // let room_key = push(ref(db, "rooms/")).key;
    let room_key = generateName();
    set(ref(db, `rooms/${room_key}`), this.room_info);
    roomIdBold.innerHTML =
      "<strong style='color:black;'>Your room ID is: " + room_key + "</strong>";
    this.join_room_page({
      roomId: room_key,
      is_tutor: true,
      html_page: "rooms",
      curr_page: "rooms",
    });
  }
  join_room(data) {
    //roomId
    // socket.emit("join_room", data);
  }
  async join_room_page(data) {
    let { roomId, is_tutor, curr_page, html_page } = data;
    is_tutor = is_tutor ? true : false;
    this.is_tutor = is_tutor;
    this.curr_page = curr_page;
    this.current_room = roomId;
    this.html_page = html_page;
    console.log(curr_page);

    //Just listen for updates on the room page
    this.roomRef = ref(db, `rooms/${this.current_room}`);
    this.usersRef = ref(db, `rooms/${this.current_room}/users`);

    let prev = await get(this.roomRef); //Retrieving latest state
    // onValue(this.roomRef, (snapshot)=>{
    //   //Always get the latest state
    //   this.room_info = snapshot.val();
    // })
    // TO not lose the default empty-like value
    this.room_info = Object.assign({}, prev.val(), this.room_info);

    if (!this.room_info) {
      console.log(`Room ${this.current_room} doesn't exist.`);
      //TODO: Should we create the room here?
    }
    // Handlers to check the number of users joined the room
    onValue(this.usersRef, (snapshot) => {
      console.log(`Found an update for users:`);
      let new_users = snapshot.val() || {};
      console.log(new_users);
      this.room_info.users = new_users;
      if (
        this.curr_page === "rooms" &&
        Object.keys(new_users).length === this.room_info.min_users_to_move
      ) {
        if (is_tutor) {
          window.location.href = `tutorial1.html?room=${this.current_room}&is_tutor=true`;
        } else {
          window.location.href = `tutorial1.html?room=${this.current_room}`;
        }
      }
    });
    // Handlers to check the number of users that are done with a given page
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
        console.log(page);
        // if (!this.room_info[page]) {
        // console.log(this.room_info);
        // console.log("ERRROR: " + page);
        // this.room_info[page] = {};
        // }
        this.room_info[page].users_done = new_users;
        if (
          this.curr_page === page &&
          Object.keys(new_users).length ===
            this.room_info[page].min_users_to_move
        ) {
          this.move_to_next_page(page);
        }
      });
    }

    // If it's a game page, keep track of wheter it has started
    if (is_game_page(curr_page) && html_page !== "index") {
      console.log(curr_page);
      this.startedGameRef = ref(
        db,
        `rooms/${this.current_room}/${curr_page}/started`
      );
      onValue(this.startedGameRef, (snapshot) => {
        let curr_started = snapshot.val() || {};
        this.room_info[curr_page].started = curr_started;
        let num_started = Object.keys(curr_started).length;
        let min_users_to_move =
          this.room_info[curr_page].min_users_to_move || 2;
        if (num_started === min_users_to_move) {
          //If everyone is ready, then actually start
          this.start_game_for_everyone();
        } else {
          for (let user_key in curr_started) {
            if (user_key !== userId) {
              if (curr_started[user_key]) {
                body.setAttribute("show-other-user-ready", "");
              } else {
                body.removeAttribute("show-other-user-ready");
              }
            }
          }
          // There are still players that need to be ready
          if (curr_started[userId]) {
            showWaitModal();
          }
          if (num_started === 0) {
            this.stop_moving_bot();
          }
        }
      });
      this.requireGraphRef = ref(
        db,
        `rooms/${this.current_room}/${curr_page}/require_graph`
      );
      onValue(this.requireGraphRef, (snapshot) => {
        let curr_require_graph = snapshot.val() || {};
        this.room_info[curr_page].require_graph = curr_require_graph;
        let num_require = Object.keys(curr_require_graph).length;
        let is_moving = body.getAttribute("is-moving") === "true";
        if (is_moving || this.html_page === "index") {
          return;
        }
        changeMovingBotsButton.disabled = num_require > 0;
        // let current_needs = userId in curr_require_graph;
        // let current_needs =
        //   this.curr_page === "game4" || !currentBotId
        //     ? true
        //     :

        // let current_needs =
        //   grid.bots[currentBotId][0].movement_type ===
        //   MOVEMENT_VALUES.DIJKSTRA.value;
        let current_needs = userId in curr_require_graph;
        // TODO: This is a hack used by my lack of patience of finding a solution
        // This should work with a final_page as well as with other tutorial (game4 in particular)
        if (current_needs) {
          loadBotButton.innerHTML = "Load bot info!";
          loadBotButton.disabled = false;
        } else {
          loadBotButton.innerHTML = "Loaded!";
          loadBotButton.disabled = true;
        }

        // this.reset_default_require_graph();
      });
      // Setup listeners for the grid bots, obstacles and coins
      this.botsRef = ref(
        db,
        `rooms/${this.current_room}/${curr_page}/grid/bots`
      );
      this.obstaclesRef = ref(
        db,
        `rooms/${this.current_room}/${curr_page}/grid/obstacles`
      );
      this.coinsRef = ref(
        db,
        `rooms/${this.current_room}/${curr_page}/grid/coins`
      );
      onChildAdded(this.botsRef, (snapshot) => {
        let bot = snapshot.val();
        let key = bot.userId;
        // If it's the own then it's already updated

        //     if (key !== userId) {
        //       grid.replace_bot(bot.id, bot, { is_new: true, fromSocket: true });
        //     } else {
        //  fresh to avoid problems
        //     }
        // Setup a listener for this bot's changes
        let bot_ref = ref(
          db,
          `rooms/${this.current_room}/${curr_page}/grid/bots/${key}`
        );
        this.bot_refs[curr_page][key] = bot_ref;
        onValue(this.bot_refs[curr_page][key], (snapshot) => {
          let bot = snapshot.val();
          if (!bot) {
            return; // Possible delete
          }
          if (!this.room_info[curr_page].grid) {
            this.room_info[curr_page].grid = {
              bots: {},
              obstacles: {},
              coins: {},
            };
          }
          if (!this.room_info[curr_page].grid.bots) {
            this.room_info[curr_page].grid.bots = {};
          }
          this.room_info[curr_page].grid.bots[key] = bot;
          grid.replace_bot(bot.id, bot, {
            is_new: false,
            fromSocket: true,
          });
          this.reset_default_require_graph();
        });
        // grid.replace_bot(bot.id, bot, {
        //   is_new: true,
        //   fromSocket: true,
        // });
        // this.reset_default_require_graph();

        if (key === userId) {
          currentBotId = bot.id;
          setupSelectedBot(bot);
          if (curr_page === "final_game") {
            // The tutorials should not be restarted
            resetBotOptions(bot); //start
          }
        }
      });
      onChildRemoved(this.botsRef, (snapshot) => {
        let bot = snapshot.val();
        delete this.room_info[this.curr_page].grid.bots[bot.id];
        delete this.bot_refs[this.curr_page][bot.id];
        grid.remove_bot(bot.id, { fromSocket: true });
        this.reset_default_require_graph();
      });
      onChildAdded(this.coinsRef, (snapshot) => {
        let coin = snapshot.val();
        let key = coin.id;
        // If it's the own then it's already updated
        grid.replace_coin(coin.id, coin, {
          is_new: true,
          fromSocket: true,
        });

        // Setup a listener for this bot's changes
        let coin_ref = ref(
          db,
          `rooms/${this.current_room}/${curr_page}/grid/coins/${key}`
        );
        this.coin_refs[curr_page][key] = coin_ref;

        onValue(this.coin_refs[curr_page][key], (snapshot) => {
          let coin = snapshot.val();
          if (!coin) {
            return; // Possible delete
          }

          if (!this.room_info[curr_page].grid) {
            this.room_info[curr_page].grid = {
              bots: {},
              obstacles: {},
              coins: {},
            };
          }
          if (!this.room_info[curr_page].grid.coins) {
            this.room_info[curr_page].grid.coins = {};
          }
          this.room_info[curr_page].grid.coins[key] = coin;
          grid.replace_coin(coin.id, coin, {
            is_new: false,
            fromSocket: true,
          });
          this.reset_default_require_graph();
        });
        this.reset_default_require_graph();
      });
      onChildRemoved(this.coinsRef, (snapshot) => {
        let coin = snapshot.val();
        delete this.room_info[this.curr_page].grid.coins[coin.id];
        delete this.coin_refs[this.curr_page][coin.id];
        grid.remove_coin(coin.id, { fromSocket: true });
        this.reset_default_require_graph();
      });
      onChildAdded(this.obstaclesRef, (snapshot) => {
        let obstacle = snapshot.val();
        let key = obstacle.id;
        // If it's the own then it's already updated
        grid.replace_obstacle(obstacle.id, obstacle, {
          is_new: true,
          fromSocket: true,
        });

        // Setup a listener for this bot's changes
        let obstacle_ref = ref(
          db,
          `rooms/${this.current_room}/${curr_page}/grid/obstacles/${key}`
        );
        this.obstacle_refs[curr_page][key] = obstacle_ref;

        onValue(this.obstacle_refs[curr_page][key], (snapshot) => {
          let obstacle = snapshot.val();
          if (!obstacle) {
            return; // Possible delete
          }

          if (!this.room_info[curr_page].grid) {
            this.room_info[curr_page].grid = {
              bots: {},
              obstacles: {},
              coins: {},
            };
          }
          if (!this.room_info[curr_page].grid.obstacles) {
            this.room_info[curr_page].grid.obstacles = {};
          }
          this.room_info[curr_page].grid.obstacles[key] = obstacle;
          grid.replace_obstacle(obstacle.id, obstacle, {
            is_new: false,
            fromSocket: true,
          });
          this.reset_default_require_graph();
        });
        this.reset_default_require_graph();
      });
      onChildRemoved(this.obstaclesRef, (snapshot) => {
        let obstacle = snapshot.val();
        console.log("trying to remove obstacle");
        console.log(obstacle);
        delete this.room_info[this.curr_page].grid.obstacles[obstacle.id];
        delete this.obstacle_refs[this.curr_page][obstacle.id];
        grid.remove_obstacle(obstacle.id, { fromSocket: true });
        this.reset_default_require_graph();
      });
    }
    //This is where users decide which theme/option to get
    if (curr_page === "final_game") {
      this.finalGameOptionsRef = ref(
        db,
        `rooms/${this.current_room}/final_game/grid/options`
      );
      if (!this.room_info.final_game) {
        this.room_info.final_game = {
          grid: {
            options: {
              theme: "",
              mode: "",
            },
          },
        };
      }
      onValue(this.finalGameOptionsRef, (snapshot) => {
        let val = snapshot.val();
        if (!val) {
          return;
        }

        this.room_info.final_game.grid.options = val;
        if (this.html_page === "index" && val.theme && val.mode) {
          this.move_to_final_game();
        }
      });
    }
    update(this.usersRef, {
      [userId]: { is_tutor },
    });
  }
  stop_moving_bot() {
    // grid.reset_ready_to_start();
    // countReadyToStart.innerText = grid.num_users_ready_to_start();
    body.removeAttribute("show-other-user-ready");
    body.removeAttribute("is-waiting-for-users");
    if (currentBotId || currentBotId === 0) {
      console.log(`Trying to stop ${currentBotId}`);
      let total_require = this.room_info.final_game.require_graph || {};
      let num_require = Object.keys(total_require).length;
      let current_needs = userId in total_require;
      changeMovingBotsButton.disabled = num_require > 0;

      if (current_needs) {
        loadBotButton.innerHTML = "Load bot info!";
        loadBotButton.disabled = false;
      } else {
        loadBotButton.innerHTML = "Loaded!";
        loadBotButton.disabled = true;
      }
      stopMovingBot(currentBotId, { fromSocket: true });
    }
  }
  move_to_final_game() {
    let { theme, mode } = this.room_info.final_game.grid.options;
    window.location.href = `virtualMode.html?room=${this.current_room}&option=${theme}&mode=${mode}`;
  }
  async start_game_for_everyone() {
    //Actually start
    set(this.requireGraphRef, {}); //No one need anything while starting
    hideWaitModal();
    body.removeAttribute("show-other-user-ready");
    await startMovingBot(currentBotId);
  }
  stop_game_for_everyone() {}
  update_url_if_tutor(url) {
    if (!this.is_tutor) {
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
  reset_default_require_graph() {
    console.log(`Status previously`);
    let x = Object.values(grid.bots).map((x) => x[0].movement_type);
    console.log(x);
    // console.log("----------Resetting default require graph-----");
    for (let bot_id in grid.bots) {
      bot_id = Number(bot_id);
      let require_graph =
        grid.bots[bot_id][0].movement_type === MOVEMENT_VALUES.DIJKSTRA.value;
      console.log(
        `For bot ${bot_id}, setting require_graph to` + require_graph
      );

      if (require_graph) {
        this.change_require_graph({ bot_id, require_graph: true });
      } else {
        this.change_require_graph({ bot_id, require_graph: false });
      }
    }
  }
  add_bot(data) {
    let { bot } = data;
    bot = { ...bot, userId };
    //bot, virtualGrid
    // socket.emit("add_bot", data);
    update(this.botsRef, {
      [userId]: bot,
    });
  }
  add_obstacle(data) {
    //obstacle, virtualGrid
    let { obstacle } = data;
    // socket.emit("add_obstacle", data);
    update(this.obstaclesRef, {
      [obstacle.id]: obstacle,
    });
  }
  add_coin(data) {
    //coin, virtualGrid
    // socket.emit("add_coin", data);
    let { coin } = data;
    console.log(coin);
    console.log(this.coinsRef);
    console.log({
      [coin.id]: coin,
    });
    update(this.coinsRef, {
      [coin.id]: coin,
    });
  }

  /*--------   Replace objects ------- */

  replace_bot(data) {
    let { bot_id, bot } = data;
    let owner = bot.userId;
    //bot_id, bot, virtualGrid
    // socket.emit("replace_bot", data);
    update(this.bot_refs[this.curr_page][owner], bot);
  }
  replace_obstacle(data) {
    let { obstacle_id, obstacle } = data;

    //obstacle_id, obstacle, virtualGrid
    // socket.emit("replace_obstacle", data);
    update(this.obstacle_refs[this.curr_page][obstacle_id], obstacle);
  }
  replace_coin(data) {
    let { coin_id, coin } = data;
    //coin_id, coin, virtualGrid
    // socket.emit("replace_coin", data);
    update(this.coin_refs[this.curr_page][coin_id], coin);
  }

  /*--------   Remove  objects ------- */

  remove_bot(data) {
    let { bot } = data;
    //bot, virtualGrid
    // socket.emit("remove_bot", data);
    remove(this.bot_refs[this.curr_page][bot.userId]);
  }
  remove_obstacle(data) {
    let { obstacle } = data;
    // obstacle, virtualGrid
    // socket.emit("remove_obstacle", data);
    remove(this.obstacle_refs[this.curr_page][obstacle.id]);
  }
  remove_coin(data) {
    let { coin } = data;

    //coin, virtualGrid
    // socket.emit("remove_coin", data);
    remove(this.coin_refs[this.curr_page][coin.id]);
  }

  /*--------   Tutorial handlers ------- */

  choose_theme(data) {
    //option (None, City,..), mode (virtual vs camera), roomId
    // socket.emit("choose_theme", data);
    let { option, mode } = data;
    update(this.finalGameOptionsRef, {
      theme: option,
      mode: mode,
    });
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
    // socket.emit("replace_bot_ready_to_start", data);
    let { bot } = data;
    let is_ready_to_start = true;
    if (!bot.is_ready_to_start) {
      is_ready_to_start = null;
    }
    update(this.startedGameRef, {
      [userId]: is_ready_to_start,
    });
    if (bot.id !== currentBotId) {
      if (bot.is_ready_to_start) {
        body.setAttribute("show-other-user-ready", "");
      } else {
        body.removeAttribute("show-other-user-ready");
      }
    }
  }
  everyone_ready_to_start(data) {
    //{}
    socket.emit("everyone_ready_to_start", data);
  }
  stop_moving(data) {
    //{}
    // socket.emit("stop_moving", data);

    //No started users
    set(this.startedGameRef, {});
  }
  change_require_graph(data) {
    let { bot_id, require_graph } = data;
    let { userId } = grid.bots[bot_id][0];
    let result = require_graph ? true : null; //So that it gets deleted
    //bot_id, require_graph
    // socket.emit("change_require_graph", data);
    update(this.requireGraphRef, {
      [userId]: result,
    });
  }
}
// db.ref("rooms").push("aaaaa");
// set(ref(db, "rooms/test-"), {
//   username: "Raul",
//   email: "ktimporta",
//   profile_picture: "xd",
// });

// export { live_updates };
