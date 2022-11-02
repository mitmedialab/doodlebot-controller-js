let worker1 = new Worker('worker.js');
let worker2 = new Worker('worker.js');


worker1.addEventListener('message', function(e) {
    console.log("message received to worker 1")
  console.log(e.data);
})

worker2.addEventListener('message', function(e) {
  console.log("message received to worker 2")
  console.log(e.data);
})

worker1.postMessage('Happy Birthday');
worker2.postMessage('Howdy');
