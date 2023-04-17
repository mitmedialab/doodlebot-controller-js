import "https://cdn.interactjs.io/v1.9.20/auto-start/index.js";
import "https://cdn.interactjs.io/v1.9.20/actions/drag/index.js";
import "https://cdn.interactjs.io/v1.9.20/actions/resize/index.js";
import "https://cdn.interactjs.io/v1.9.20/modifiers/index.js";
import "https://cdn.interactjs.io/v1.9.20/dev-tools/index.js";
import interact from "https://cdn.interactjs.io/v1.9.20/interactjs/index.js";

/**
 *
 * @param {*} id ${TYPE}-${id}n The id of the DOM element
 * @param {*} object
 * @param {*} cell_size
 */
const setupDraggable = (id, cell_size) => {
  let grid = window.grid;

  interact(`#${id}`).draggable({
    inertia: true,
    modifiers: [
      // interact.modifiers.restrictRect({
      //   restriction: "parent",
      //   endOnly: true,
      // }),
      interact.modifiers.snap({
        targets: [interact.snappers.grid({ x: cell_size, y: cell_size })],
        // range: Infinity,
        relativePoints: [{ x: 0, y: 0 }],
      }),
    ],
    //   autoScroll: true,
    // dragMoveListener from the dragging demo above
    listeners: {
      move: dragMoveListener,
      end: (event) => dragEndListener(event, id, cell_size),
    },
  });
  //Resize is still TBD
  // .resizable({
  //   edges: {
  //     top: true,
  //     left: false,
  //     bottom: false,
  //     right: true,
  //   },
  //   snapSize: {
  //     // targets: [{ width: 100, height: 100, range: 100 }],
  //     targets: [
  //       interact.createSnapGrid({
  //         x: cell_size,
  //         y: cell_size,
  //         range: cell_size,
  //       }),
  //     ],
  //   },
  //   // modifiers: [
  //   //   interact.modifiers.aspectRatio({
  //   //     ratio: "equalDelta",
  //   //   }),
  //   // ],
  //   listeners: {
  //     move: (event) => {
  //       let { x, y } = event.target.dataset;

  //       x = (parseFloat(x) || 0) + event.deltaRect.left;
  //       y = (parseFloat(y) || 0) + event.deltaRect.top;

  //       // let image = document.querySelector("image", event.target);
  //       let image = event.target.getElementsByTagName("img")[0];
  //       Object.assign(image.style, {
  //         width: `${event.rect.width}px`,
  //         height: `${event.rect.height}px`,
  //       });
  //       Object.assign(event.target.style, {
  //         transform: `translate(${x}px, ${y}px)`,
  //       });
  //       Object.assign(event.target.dataset, { x, y });
  //     },
  //   },
  // });
};
/////////////////////////////////////////DRAGGING////////////////////////////////////////////////////
// target elements with the "draggable" class
// interact(".draggable").draggable({
//   // enable inertial throwing
//   inertia: true,
//   // keep the element within the area of it's parent
//   modifiers: [
//     interact.modifiers.snap({
//       targets: [interact.snappers.grid({ x: 300, y: 300 })],
//       // range: Infinity,
//       // relativePoints: [{ x: 0, y: 0 }]
//     }),
//     interact.modifiers.restrictRect({
//       restriction: "parent",
//       endOnly: true,
//     }),
//   ],
//   // enable autoScroll
//   autoScroll: true,

//   listeners: {
//     // call this function on every dragmove event
//     move: dragMoveListener,

//     // call this function on every dragend event
//     end(event) {
//       var textEl = event.target.querySelector("p");

//       textEl &&
//         (textEl.textContent =
//           "moved a distance of " +
//           Math.sqrt(
//             (Math.pow(event.pageX - event.x0, 2) +
//               Math.pow(event.pageY - event.y0, 2)) |
//               0
//           ).toFixed(2) +
//           "px");
//     },
//   },
// });

/**
 * Stores the total delta in `data-x` and `data-y` properties
 * @param {*} event
 */
function dragMoveListener(event) {
  console.log(event);
  var target = event.target;
  // keep the dragged position in the data-x/data-y attributes
  var x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
  var y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

  // translate the element
  target.style.transform = "translate(" + x + "px, " + y + "px)";

  // update the posiion attributes
  target.setAttribute("data-x", x);
  target.setAttribute("data-y", y);
}
function dragEndListener(event, id, cell_size) {
  let div = document.getElementById(id);
  let [type, obj_id] = id.split("-");
  let object;
  if (type === BOT_TYPE) {
    object = grid.bots[obj_id][0];
  } else if (type === OBSTACLE_TYPE) {
    object = grid.obstacles[obj_id][0];
  } else if (type === COIN_TYPE) {
    object = grid.coins[obj_id][0];
  } else {
    console.log(`In valid type ${type} from if '${id}'`);
  }
  // let dx = event.page.x - event.x0;
  // let dy = event.page.y - event.y0;
  let dx = Number(div.getAttribute("data-x") || 0);
  let dy = -Number(div.getAttribute("data-y") || 0); // the Y axis is backwards

  let di = Math.round(dx / cell_size);
  let dj = Math.round(dy / cell_size);
  let i = object.real_bottom_left[0] + di;
  let j = object.real_bottom_left[1] + dj;
  console.log(
    `Moved [${di}, ${dj}] from ${object.real_bottom_left} to ${[i, j]}`
  );
  // Try different methods depending on the type of object
  let res = {};
  if (type === BOT_TYPE) {
    res = grid.update_bot(object.id, {
      real_bottom_left: [i, j],
    });
  } else if (type === OBSTACLE_TYPE) {
    res = grid.update_obstacle(object.id, {
      real_bottom_left: [i, j],
    });
  } else if (type === COIN_TYPE) {
    res = grid.update_coin(object.id, {
      real_bottom_left: [i, j],
    });
  } else {
    console.log(`In valid type ${type} from if '${id}'`);
  }
  let { success } = res;

  if (!success) {
    [i, j] = object.real_bottom_left; //Storing the original
  }
  div.style.left = `${cell_size * i}px`;
  div.style.bottom = `${cell_size * j}px`;

  //To put it back as new
  div.style.transform = null;
  div.removeAttribute("data-x");
  div.removeAttribute("data-y");
}
// this is used later in the resizing
window.dragMoveListener = dragMoveListener;
window.dragEndListener = dragEndListener;

/////////////////////////////////////////DROPPING////////////////////////////////////////////////////
// enable draggables to be dropped into this
interact(".dropzone").dropzone({
  // only accept elements matching this CSS selector
  accept: "#yes-drop",
  // Require a 75% element overlap for a drop to be possible
  overlap: 0.75,

  // listen for drop related events:
  ondropactivate: function (event) {
    // add active dropzone feedback
    event.target.classList.add("drop-active");
  },
  ondragenter: function (event) {
    var draggableElement = event.relatedTarget;
    var dropzoneElement = event.target;

    // feedback the possibility of a drop
    dropzoneElement.classList.add("drop-target");
    draggableElement.classList.add("can-drop");
    draggableElement.textContent = "Dragged in";
  },
  ondragleave: function (event) {
    // remove the drop feedback style
    event.target.classList.remove("drop-target");
    event.relatedTarget.classList.remove("can-drop");
    event.relatedTarget.textContent = "Dragged out";
  },
  ondrop: function (event) {
    event.relatedTarget.textContent = "Dropped";
  },
  ondropdeactivate: function (event) {
    // remove active dropzone feedback
    event.target.classList.remove("drop-active");
    event.target.classList.remove("drop-target");
  },
});

interact(".drag-drop").draggable({
  inertia: true,
  //   origin: "self",
  //   snap: {
  //     targets: [
  //       interact.createSnapGrid({
  //         x: 100,
  //         y: 100,
  //         // limit to the container dimensions
  //         limits: {
  //           left: 0,
  //           top: 0,
  //           right: 500 - 100,
  //           bottom: 500 - 100,
  //         },
  //       }),
  //     ],
  //     relativePoints: [{ x: 0, y: 0 }],
  //   },
  modifiers: [
    // interact.modifiers.restrictRect({
    //   restriction: "parent",
    //   endOnly: true,
    // }),
    interact.modifiers.snap({
      targets: [interact.snappers.grid({ x: 100, y: 100 })],
      // range: Infinity,
      relativePoints: [{ x: 0, y: 0 }],
    }),
  ],
  //   autoScroll: true,
  // dragMoveListener from the dragging demo above
  listeners: { move: dragMoveListener },
});
interact(".drag-drop").resizable({
  //   origin: "self",
  edges: {
    top: true, // Use pointer coords to check for resize.
    left: true, // Disable resizing from left edge.
    bottom: true, // Resize if pointer target matches selector
    right: true, // Resize if pointer target is the given Element
  },
  snapSize: {
    // targets: [{ width: 100, height: 100, range: 100 }],
    targets: [
      interact.createSnapGrid({
        x: 100,
        y: 100,
        range: 100,
      }),
    ],
  },
  listeners: {
    move: function (event) {
      let { x, y } = event.target.dataset;

      x = (parseFloat(x) || 0) + event.deltaRect.left;
      y = (parseFloat(y) || 0) + event.deltaRect.top;

      Object.assign(event.target.style, {
        width: `${event.rect.width}px`,
        height: `${event.rect.height}px`,
        transform: `translate(${x}px, ${y}px)`,
      });

      Object.assign(event.target.dataset, { x, y });
    },
  },
});

/////////////////////////////////////////RESIZING////////////////////////////////////////////////////
// interact(".resize-drag")
//   .resizable({
//     // resize from all edges and corners
//     edges: { left: true, right: true, bottom: true, top: true },

//     listeners: {
//       move(event) {
//         var target = event.target;
//         var x = parseFloat(target.getAttribute("data-x")) || 0;
//         var y = parseFloat(target.getAttribute("data-y")) || 0;

//         // update the element's style
//         target.style.width = event.rect.width + "px";
//         target.style.height = event.rect.height + "px";

//         // translate when resizing from top or left edges
//         x += event.deltaRect.left;
//         y += event.deltaRect.top;

//         target.style.transform = "translate(" + x + "px," + y + "px)";

//         target.setAttribute("data-x", x);
//         target.setAttribute("data-y", y);
//         target.textContent =
//           Math.round(event.rect.width) +
//           "\u00D7" +
//           Math.round(event.rect.height);
//       },
//     },
//     modifiers: [
//       // keep the edges inside the parent
//       interact.modifiers.restrictEdges({
//         outer: "parent",
//       }),

//       // minimum size
//       interact.modifiers.restrictSize({
//         min: { width: 100, height: 50 },
//       }),
//     ],

//     inertia: true,
//   })
//   .draggable({
//     listeners: { move: window.dragMoveListener },
//     inertia: true,
//     modifiers: [
//       interact.modifiers.restrictRect({
//         restriction: "parent",
//         endOnly: true,
//       }),
//     ],
//   });

export { setupDraggable };