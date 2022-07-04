import EventEmitter from "events";
import { run } from 'ar-gql';
import { GQLTagInterface, Status } from "./interfaces";
import { GQLEdgeInterface } from "ar-gql/dist/faces";

export { GQLTagInterface };

export default class Sync extends EventEmitter {
  private txTags: GQLTagInterface[];
  private nTxsPerQuery: number;
  private status: Status = Status.stopped;
  private latestTx: GQLEdgeInterface | undefined;
  private txCounter: number = 0;

  constructor(txTags: GQLTagInterface[], nTxsPerQuery = 100) {
    super();
    this.txTags = txTags;
    this.nTxsPerQuery = nTxsPerQuery;
  }

  private getTransactions = async (nTxsPerQuery = 100) => {
    const query = `{
      transactions(
        ${this.latestTx ? `after: "${this.latestTx.cursor}"` : ''}
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

    const result = await run(query);
    return result.data.transactions.edges;
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

    const result = (await run(query)).data.transactions.edges;
    const latestTxIndex = result.findIndex(e => e.node.id === this.latestTx?.node.id);
    const txs = result.slice(0, latestTxIndex);

    if(txs.length > 0){
      this.latestTx = txs[txs.length-1];
      this.txCounter += txs.length;
      this.emit('response', {txs, txCounter: this.txCounter})
    }
    
    setTimeout(this.getLatestTransactions, 2000);
  }

  public getStatus = () => this.status;

  async start() {
    this.status = Status.syncing;
    this.emit('start');
    let syncing = true;
    while(syncing){
      this.emit('request');
      try{
        const txs: GQLEdgeInterface[] = await this.getTransactions(this.nTxsPerQuery);
        
        this.latestTx = txs[txs.length-1];
        this.txCounter += txs.length;
        this.emit('response', {txs, txCounter: this.txCounter});

        if(txs.length < this.nTxsPerQuery) {
          this.emit('synchronized');
          syncing = false;
        }
      }
      catch (e) {
        this.emit('exception', e);
      }
    }
    this.status = Status.synced;
    this.getLatestTransactions();
  }
}
