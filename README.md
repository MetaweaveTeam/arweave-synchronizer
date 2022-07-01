# Arweave synchronizer node

A cool tool to process and sync all transactions from a custom GQL query.

## Potential usage cases

- Gather metrics of a specific data protocol

## Documentation

### 1. Getting started

```
$ npm install arweave-synchronizer
```

```typescript
import Synchronizer from 'arweave-synchronizer';

const sync = new Sync(gql_query);

sync.start();
```

### 2. Listeners

```typescript
sync.on('response', ({txs, txCounter, timestamp, cursor}) => {
  // process the transactions page 
});
```

# To do

- Add optional caching that would store the `txCounter` in a flat file so stopping synchronization doesn't require to start over from the beginning
