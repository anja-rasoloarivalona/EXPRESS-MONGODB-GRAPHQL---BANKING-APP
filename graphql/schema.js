const { buildSchema } = require('graphql')

module.exports = buildSchema(`
    type Transaction {
        counterparty: String!
        details: String!
        usedWallet: String!
        amount: Int!
        status: String
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        transactions: [Transaction!]
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
        getUser: User!
    }
    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
