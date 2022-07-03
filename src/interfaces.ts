export interface GQLTagInterface {
  name: string;
  values: string | string[];
  op?: "EQ" | "NEQ"
}

export enum Status {
  stopped = "stopped",
  syncing = "syncing",
  synced = "synced"
}