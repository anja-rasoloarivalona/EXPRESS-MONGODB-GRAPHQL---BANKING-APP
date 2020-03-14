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
        cardType: String!
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
    
    input CardInputData {
        userId: String!
        cardType: String!
        supplier: String!
        amount: String!
        shortId: String
        color: String!
    }


    type RootMutation {
        createUser(userInput: UserInputData): AuthData!
        createNewCard(cardInput: CardInputData): Wallet!
        updatedOwnedCard(cardId: String!, cardInput: CardInputData!): Wallet!
    }

    type RootQuery {
        user(userId: String!): User!
        login(email: String!, password: String!): AuthData!
    }
    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
