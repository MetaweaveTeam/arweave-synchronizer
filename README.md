# Arweave synchronizer node

A cool tool to process and sync all transactions from a custom GQL query.

## Potential usage cases

- Gather metrics of a specific data protocol

## Documentation

### Getting started

```
$ npm install arweave-synchronizer
```

```typescript
import Synchronizer, { GQLTagInterface } from 'arweave-synchronizer';

const sync = new Synchronizer(GQLTagInterface[]);

sync.on('response', ({txs, txCounter, timestamp, cursor}) => {
  // process the page of transactions here
});

sync.start(); // This must be called at the end
```

### Event listeners

> ⚠️ Event listeners must be set __before__ `sync.start()` method is called or it won't work.

In chronological order:

- on `start`:
```typescript
sync.on('start', () => console.log(" 🚦 Starting the synchronizer..."));
```

- on `request`:
```typescript
sync.on('request', () => console.log(" 🔄 Requesting transactions, waiting for response..."));
```

- on `exception`:
```typescript
sync.on('exception', (e) => console.log(` ❌ ${e.message}`));
```

- on `response`:
```typescript
sync.on('response', ({txs, txCounter, timestamp, cursor}) => {
  // process the transactions page 
});
```

- on `synchronized`:
```typescript
sync.on('synchronized', () => console.log(" ✅ The node has synchronized with the Blockweave."));
```

### Status

You can get the current status:
```
console.log(sync.getStatus()) // return "stopped", "syncing" or "synced"
```

# To do

- Add optional caching that would store the `txCounter` in a flat file so stopping synchronization doesn't require to start over from the beginning
