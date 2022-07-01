import EventEmitter from "events";

const txN = 100;
const now = () => Math.floor(Date.now() / 1000);

class Sync extends EventEmitter {
  constructor() {
    super();
  }

  async start() {
    let cursor = null, timestamp = 0, txCounter = 0, syncing = true;
    while(syncing){
      // const weeves = await getWeeves(cursor, txN);
  
      // txCounter += weeves.length;
      // weeves.forEach(w => {
      //   cursor = w.cursor;
      //   timestamp = w.node.block ? w.node.block.timestamp : timestamp; // recently added txs has block = null
      //   /*
      //     ADD: save in db
      //    */
      // });

      this.emit('save', {timestamp, cursor, txCounter});
  
      // if(weeves.length < txN) syncing = false;
    }
  }
}

export default Sync;