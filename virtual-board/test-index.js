import "https://cdn.interactjs.io/v1.9.20/auto-start/index.js";
import "https://cdn.interactjs.io/v1.9.20/actions/drag/index.js";
import "https://cdn.interactjs.io/v1.9.20/actions/resize/index.js";
import "https://cdn.interactjs.io/v1.9.20/modifiers/index.js";
import "https://cdn.interactjs.io/v1.9.20/dev-tools/index.js";
import interact from "https://cdn.interactjs.io/v1.9.20/interactjs/index.js";

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
// this is used later in the resizing
window.dragMoveListener = dragMoveListener;

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
