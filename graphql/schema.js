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

    type AuthData {
        token: String!
        user: User!
    }

    type Wallet {
        _id: ID!
        walletType: String!
        supplier: String!
        amount: Int!
        shortId: String
        color: String!
        owner: String
    }

    input UserInputData {
        email: String!
        name: String!
        password: String!
    }
    
    input WalletInputData {
        walletType: String!
        supplier: String!
        amount: String!
        shortId: String
        color: String!
    }

    type RootMutation {
        createUser(userInput: UserInputData): AuthData!
        addWallet(walletInput: WalletInputData): Wallet!
        editWallet(walletId: String!, walletInput: WalletInputData!): Wallet!
    }

    type RootQuery {
        user: User!
        login(email: String!, password: String!): AuthData!
    }
    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
