import EventEmitter from "events";
import { run } from 'ar-gql';
import { GQLTagInterface, Status } from "./interfaces";
import { GQLEdgeInterface } from "ar-gql/dist/faces";

export { GQLTagInterface };

export default class Sync extends EventEmitter {
  private nTxsPerQuery: number;
  private delay: number;
  private txTags: GQLTagInterface[];
  private status: Status = Status.stopped;
  private latestTx: GQLEdgeInterface | undefined;
  private txCounter: number = 0;

  constructor(txTags: GQLTagInterface[], nTxsPerQuery = 100, delay = 5000) {
    super();
    this.txTags = txTags;
    this.nTxsPerQuery = nTxsPerQuery;
    this.delay = delay;
  }

  private updateTxPosition = (txs: GQLEdgeInterface[]) => {
    this.latestTx = txs[txs.length-1];
    this.txCounter += txs.length;
    this.emit('response', {txs, txCounter: this.txCounter});
  }

  private synchronizeTransactions = async () => {
    const query = `{
      transactions(
        ${this.latestTx ? `after: "${this.latestTx.cursor}"` : ''}
        first: ${this.nTxsPerQuery}
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

    this.emit('request');
    const txs = (await run(query)).data.transactions.edges;
    this.updateTxPosition(txs);
    
    if(txs.length < this.nTxsPerQuery) this.emit('synchronized');
    else await this.synchronizeTransactions();
  }

  private getLatestTransactions = async () => {
    const query = `{
      transactions(
        first: 100
        tags: ${JSON.stringify(this.txTags).replace(/"([^"]+)":/g, '$1:')}
        sort: HEIGHT_DESC
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

    this.emit('request');
    const result = (await run(query)).data.transactions.edges;
    const latestTxIndex = result.findIndex(e => e.node.id === this.latestTx?.node.id);
    const txs = result.slice(0, latestTxIndex);

    if(txs.length > 0) this.updateTxPosition(txs);
    
    setTimeout(this.getLatestTransactions, this.delay);
  }

  public getStatus = () => this.status;

  public start = async () => {
    this.status = Status.syncing;
    this.emit('start');
    
    try { 
      await this.synchronizeTransactions();
      this.status = Status.synced;
      await this.getLatestTransactions();
    }
    catch(e) { this.emit('exception', e); }
  }
}
