import EventEmitter from "events";
import { run, tx } from 'ar-gql';
import { GQLTagInterface } from "./interfaces";
import { GQLEdgeInterface } from "ar-gql/dist/faces";

const txN = 100;
const now = () => Math.floor(Date.now() / 1000);

export { GQLTagInterface };

export default class Sync extends EventEmitter {
  private txTags: GQLTagInterface[];
  private nTxsPerQuery: number;

  constructor(txTags: GQLTagInterface[], nTxsPerQuery = 100) {
    super();
    this.txTags = txTags;
    this.nTxsPerQuery = nTxsPerQuery;
  }

  private getTransactions = async (cursor: string | null = null, nTxsPerQuery = 100) => {
    const query = `{
      transactions(
        ${cursor ? `after: "${cursor}"` : ''}
        first: ${nTxsPerQuery}
        tags: ${JSON.stringify(this.txTags).replace(/"([^"]+)":/g, '$1:')}
        sort: HEIGHT_ASC
      ) {
        edges {
          cursor
          node {
            id
            block { timestamp }
          }
        }
      }
    }`;

    // console.log(query);
    
    const result = await run(query);
    return result.data.transactions.edges;
  }

  async start() {
    this.emit('start');
    let cursor = null, timestamp = 0, txCounter = 0, syncing = true;
    while(syncing){
      this.emit('request');
      try{
        const txs: GQLEdgeInterface[] = await this.getTransactions(cursor, this.nTxsPerQuery);
        
        const lastTx = txs[txs.length-1];
        timestamp = lastTx.node.block ? lastTx.node.block.timestamp : timestamp;
        cursor = lastTx.cursor;
        txCounter += txs.length;
        
        this.emit('response', {txs, timestamp, cursor, txCounter});
        if(txs.length < this.nTxsPerQuery) {
          this.emit('synchronized');
          syncing = false;
        }
      }
      catch (e) {
        this.emit('exception', e);
      }
    }
  }
}
