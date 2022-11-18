// Files for each doodlebot, to be able to move independently (multi-threaded)
importScripts("doodlebot_control/doodlebot.js");


// Main handler for this worker
// {type, data} where 
// type is a string and data is te the given type's callback wil
// need
// Different types:
let bot;
let name;

function log(message){
    //TODO: Do we know whether these messages will be sent synchronously
    //Probably async, so no order to be expected in the logs
    self.postMessage({type:"log", data: {message:`From worker with name ${name}`}})
    self.postMessage({type:"log", data: {message:message}})
}

function onReceiveValue(evt) {
  const view = evt.target.value;
  log("Received:");
  var enc = new TextDecoder("utf-8"); // always utf-8
  log(enc.decode(view.buffer));
}

const create = async (data) =>{
    let {bot} = data
    bot = new Doodlebot(bot, log, onReceiveValue);
    await bot.request_device();
    await bot.connect();

    //Send confirmation back
    name = bot.name;
    self.postMessage({type:"create", data:{id: bot.id, name:bot.name}})
    return;
}


const ALL_METHODS = {
    create: create,

}
/**
 * Different types:
 * 
 * - create: Creates doodlebot instance
 * -  
 */
self.addEventListener('message', async (e) =>{
    let {type, data} = e.data;
    if (!ALL_METHODS[type]){
        log(`[bot_worker] No valid method type ${type}`)
    } else{
        //passing the data to the method bounded by the type we have
        let res = await ALL_METHODS[type](data);
        console.log(res);
        //If the method returns something, just send it back to the main thread
        if (res){
            self.postMessage({type, res})
        }
    }
})

