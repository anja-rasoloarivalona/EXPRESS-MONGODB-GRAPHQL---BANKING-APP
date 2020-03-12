const { buildSchema } = require('graphql')

module.exports = buildSchema(`
    type Transaction {
        counterparty: String!
        details: String!
        date: String!
        usedWallet: String!
        amount: Int!
        status: String
    }

    type Wallet {
        type: String!
        supplier: String!
        amount: Int!
        shortId: String
    }

    type Budget {
        name: String!
        amount: Int!
        used: Int!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String!
        status: String!
        transactions: [Transaction!]
        wallets: [Wallet!]
        budgets: [Budget!]
    }

    input UserInputData {
        email: String!
        name: String!
        password: String!
    } 


    type RootMutation {
        createUser(userInput: UserInputData): User!
    }

    type RootQuery {
        user: User!
    }
    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
