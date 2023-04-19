import "https://cdn.interactjs.io/v1.9.20/auto-start/index.js";
import "https://cdn.interactjs.io/v1.9.20/actions/drag/index.js";
import "https://cdn.interactjs.io/v1.9.20/actions/resize/index.js";
import "https://cdn.interactjs.io/v1.9.20/modifiers/index.js";
import "https://cdn.interactjs.io/v1.9.20/dev-tools/index.js";
import interact from "https://cdn.interactjs.io/v1.9.20/interactjs/index.js";
// let cell_size = 60;

/**
 *
 * @param {*} id ${TYPE}-${id}n The id of the DOM element
 * @param {*} object
 * @param {*} cell_size
 */
const setupDraggable = (selector, cell_size) => {
  interact(selector)
    .draggable({
      manualStart: true,
      inertia: true,
      modifiers: [
        interact.modifiers.snap({
          targets: [interact.snappers.grid({ x: cell_size, y: cell_size })],
          relativePoints: [{ x: 0, y: 0 }],
        }),
      ],
      //   autoScroll: true,
      // dragMoveListener from the dragging demo above
      listeners: {
        move: dragMoveListener,
        end: onDropHandler,
      },
    })
    .on("move", function (event) {
      var interaction = event.interaction;
      // if the pointer was moved while being held down
      // and an interaction hasn't started yet
      if (interaction.pointerIsDown && !interaction.interacting()) {
        let original = event.currentTarget;

        //It's clone if it's one of the ones that is mid-drag or one that is already part
        //of the grid
        let is_clone =
          original.getAttribute("clone") === "true" ||
          original.getAttribute("id") != null;
        if (!is_clone) {
          // create a clone of the currentTarget element
          let clone = event.currentTarget.cloneNode(true);
          clone.setAttribute("clone", "true");
          clone.classList.add("grabbing");
          clone.style.position = "absolute";
          let { left, top } = original.getBoundingClientRect();
          clone.style.left = `${left}px`;
          clone.style.top = `${top}px`;
          clone.classList.remove("template"); //To make sure it's no the original
          clone.style.touchAction = "none";

          document.body.appendChild(clone);

          // start a drag interaction targeting the clone
          interaction.start({ name: "drag" }, event.interactable, clone);
        } else {
          // Should still be able to be dragged, but don't make a copy
          original.classList.add("grabbing");
          interaction.start({ name: "drag" }, event.interactable, original);
        }
      }
    });
};
/**
 * Stores the total delta in `data-x` and `data-y` properties
 * @param {*} event
 */
function dragMoveListener(event) {
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
function updateVirtualGrid(obj_id, type, grid_position) {
  console.log(
    `Trying to update virtual grid with id ${obj_id} and type ${type}`
  );
  let [i, j] = grid_position;
  let object;
  if (type === BOT_TYPE) {
    object = grid.bots[obj_id][0];
  } else if (type === OBSTACLE_TYPE) {
    object = grid.obstacles[obj_id][0];
  } else if (type === COIN_TYPE) {
    object = grid.coins[obj_id][0];
  } else {
    console.log(`Invalid type ${type} from object with id '${obj_id}'`);
  }
  console.log(`Object: `);
  console.log(object);

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
    console.log(`Invalid type ${type} from if '${id}'`);
  }
  console.log("Resultados: ");
  console.log(res);
  let { success } = res;

  if (!success) {
    console.log(res);
    i = object.real_bottom_left[0]; //Storing the original
    j = object.real_bottom_left[1];
  }

  let div = document.getElementById(`${type}-${obj_id}`);
  console.log(`New bottom left: ${[i, j]} `);
  console.log(div);
  div.style.left = `${cell_size * i}px`;
  div.style.bottom = `${cell_size * j}px`;
  console.log("Removing attributes...");
  //To put it back as new
  div.style.transform = null;
  div.removeAttribute("data-x");
  div.removeAttribute("data-y");
  console.log("Done!");
}
// this is used later in the resizing
window.dragMoveListener = dragMoveListener;

/**
 * Get the position of the `element` with respect to `grid`.
 * Uses `getBoundingClientRect` to determine relative position
 *
 * @param {*} grid
 * @param {*} element
 * @returns
 */
function getRelativeBottomLeft(grid, element) {
  // (0, 0) is on top left of the screen
  let gridRect = grid.getBoundingClientRect();
  let gridLeft = gridRect.left;
  let gridBottom = gridRect.bottom;

  let elementRect = element.getBoundingClientRect();
  let elementLeft = elementRect.left;
  let elementBottom = elementRect.bottom;

  let dx = elementLeft - gridLeft;
  let dy = gridBottom - elementBottom; // as grid positions are calculated different
  return [dx, dy];
}

function onDropHandler(event) {
  // event.relatedTarget.textContent = "Dropped";
  console.log("Dropped!");
  console.log(event);
  // Below is when drop comes from the dropzone
  // let gridDiv = event.target;
  // let element = event.relatedTarget;

  let element = event.target;
  let gridDiv = document.getElementById("gridContainer");

  let [dx, dy] = getRelativeBottomLeft(gridDiv, element);
  let gridX = Math.round(dx / cell_size); //Have cell_size be part of the info
  let gridY = Math.round(dy / cell_size); //Have cell_size
  console.log([gridX, gridY]);
  console.log([rows, cols]);
  //It only has an id if it's already part of the grid
  let is_new = element.getAttribute("id") == null;
  let is_valid = !(0 > gridX || gridX >= cols || 0 > gridY || gridY >= rows);

  if (!is_new) {
    console.log("Curren bot, just updating!");
    //If it's a clone that moved, then just update
    console.log(`is_valid = ${is_valid}`);
    if (is_valid) {
      //Only update if it's valid, if not go back
      let div_id = element.getAttribute("id");
      let [type, obj_id] = div_id.split("-");
      updateVirtualGrid(obj_id, type, [gridX, gridY]);
    }
  } else {
    //If it's a new and it's outisde just don't add it
    if (!is_valid) {
      // Outside the board :0
      element.remove();
      return;
    }
    //If it's the original that moved then create the object on the grid
    let { image, width, height, type } =
      ALL_ASSETS[element.getAttribute("template_id")];
    console.log(`New ${type}, adding to grid!`);

    if (type === BOT_TYPE) {
      let id = grid.getNewBotId();

      grid.add_bot({
        id: id,
        real_bottom_left: [gridX, gridY],
        image: image,
        policies: new Set(["Get coins"]), //TODO: Don't hardcode this
        width: width,
        height: height,
        angle: 0,
        relative_anchor: [1, 1], //TODO: Get from div element
      });
    } else if (type === OBSTACLE_TYPE) {
      let id = grid.getNewObstacleId();

      grid.add_obstacle({
        id: id,
        real_bottom_left: [gridX, gridY],
        image: image,
        width: width,
        height: height,
      });
    } else if (type === COIN_TYPE) {
      let id = grid.getNewCoinId();

      grid.add_coin({
        id: id,
        real_bottom_left: [gridX, gridY],
        image: image,
        width: width,
        height: height,
      });
    } else {
      console.log(`Invalid type: ${type}`);
    }

    //This div not needed anymore, a new one will be created in onAddBot
    element.remove();
  }
}
/////////////////////////////////////////DROPPING////////////////////////////////////////////////////
// enable draggables to be dropped into this
function setupGridDropzone(cell_size) {
  interact(".dropzone").dropzone({
    accept: "*",
    overlap: 0.75,
    // listen for drop related events:
    ondropactivate: function (event) {
      console.log("on drop activate");
      // add active dropzone feedback
      event.target.classList.add("drop-active");
    },
    // Entered dropzone!
    ondragenter: function (event) {
      console.log("on drop enter");
      var draggableElement = event.relatedTarget;
      var dropzoneElement = event.target;

      // feedback the possibility of a drop
      dropzoneElement.classList.add("drop-target");
      draggableElement.classList.add("can-drop");
    },
    //Left dropzone!
    ondragleave: function (event) {
      console.log("on drop leave");

      // remove the drop feedback style
      event.target.classList.remove("drop-target");
      event.relatedTarget.classList.remove("can-drop");
      // event.relatedTarget.textContent = "Dragged out";
    },
    ondrop: (event) => {},
    ondropdeactivate: function (event) {
      console.log("on drop deactivate");
      // remove active dropzone feedback
      event.target.classList.remove("drop-active");
      event.target.classList.remove("drop-target");
    },
  });
}

export { setupDraggable, setupGridDropzone };
