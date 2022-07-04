export const gqlTransactionConnection = `
{
  edges {
    cursor
    node {
      id
      anchor
      signature
      recipient
      owner {
        key
        address
      }
      fee {
        winston
        ar
      }
      quantity {
        winston
        ar
      }
      data {
        size
        type
      }
      tags {
        name
        value
      }
      block {
        id
        timestamp
        height
        previous
      }
      bundledIn { id }
    }
  }
}
`;