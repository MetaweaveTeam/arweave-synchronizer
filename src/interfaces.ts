export interface GQLTagInterface {
  name: string;
  values: string | string[];
  op?: "EQ" | "NEQ"
}