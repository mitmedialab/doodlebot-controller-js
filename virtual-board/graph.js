// Initial code taken from https://github.com/noamsauerutley/shortest-path
// Modified to allow method to 1) add extra information to edges and 2) return those edges on the firstShortestPath method

/**
 *
 * @param {*} distances object for recording distances from the start node. Of the form {node: <distance>}
 * @param {Array} visited array of nodes that have already been visited
 * @returns closest non-visited node
 */
const shortestDistanceNode = (distances, visited) => {
  let shortest = null;

  for (let node in distances) {
    let currentIsShortest =
      shortest === null || distances[node] < distances[shortest];
    if (currentIsShortest && !visited.includes(node)) {
      shortest = node;
    }
  }
  return shortest;
};
let INFINITY = "Infinity";

/**
 *
 * @param {Object} graph Format is {node: {node2: {weight: <weight>, info: ..extra info..}}}
 * @param {string} startNode
 * @param {string} endNode
 * @param {boolean} show_logs
 * @returns {Object} {distances: {node: Number || null},  parents: {node: node || null}}
 */
const findShortestPathDistances = (
  graph,
  startNode,
  endNode,
  show_logs = false
) => {
  // if (!(startNode in graph) | !(endNode in graph)){
  if (!(startNode in graph)) {
    // console.log(`Invalid nodes`)
    return { distances: {}, parents: {} };
    // return {
    //     distance: null,
    //     path_nodes: null,
    //     path_edges: null,
    // }
  }
  const log = show_logs
    ? (x) => {
        console.log(x);
      }
    : (x) => {};

  // establish object for recording distances from the start node
  let distances = { [startNode]: 0 };
  // distances[endNode] = INFINITY; //so far only counting from start
  for (let child in graph[startNode]) {
    distances[child] = graph[startNode][child].weight;
  }
  // distances = Object.assign(distances, graph[startNode]);

  // track paths
  // let parents = { [endNode]: null }; //so far only counting from start
  let parents = {};
  for (let child in graph[startNode]) {
    parents[child] = startNode;
  }

  // track nodes that have already been visited
  let visited = [];

  // find the nearest node
  let node = shortestDistanceNode(distances, visited);

  // for that node
  while (node) {
    // find its distance from the start node & its child nodes
    let distance = distances[node];
    let children = graph[node];
    // for each of those child nodes
    for (let child in children) {
      // make sure each child node is not the start node
      if (String(child) === String(startNode)) {
        log("don't return to the start node! 🙅");
        continue;
      } else {
        log("startNode: " + startNode);
        log("distance from node " + parents[node] + " to node " + node + ")");
        log("previous distance: " + distances[node]);
        // save the distance from the start node to the child node
        let newdistance = distance + children[child].weight;
        log("new distance: " + newdistance);
        // if there's no recorded distance from the start node to the child node in the distances object
        // or if the recorded distance is shorter than the previously stored distance from the start node to the child node
        // save the distance to the object
        // record the path
        if (!(child in distances) || distances[child] > newdistance) {
          distances[child] = newdistance;
          parents[child] = node;
          log("distance + parents updated");
        } else {
          log("not updating, because a shorter path already exists!");
        }
      }
    }
    // move the node to the visited set
    visited.push(node);
    // move to the nearest neighbor node
    node = shortestDistanceNode(distances, visited);
  }
  return { distances, parents };

  // using the stored paths from start node to end node
  // record the shortest path
  if (distances[endNode] === INFINITY) {
    return {
      distance: null,
      path_nodes: null,
      path_edges: null,
    };
  }
  let shortestPath = [endNode];
  let parent = parents[endNode];
  let count = 0;
  while (count < 100 && parent) {
    shortestPath.push(parent);
    parent = parents[parent];
    count += 1;
  }
  shortestPath.reverse();
  let path_edges = [];
  for (let i = 0; i < shortestPath.length - 1; i++) {
    let start = shortestPath[i];
    let end = shortestPath[i + 1];
    path_edges.push(graph[start][end]);
  }
  // return the shortest path from start node to end node & its distance
  let results = {
    distance: distances[endNode],
    path_nodes: shortestPath,
    path_edges: path_edges,
  };

  return results;
};
