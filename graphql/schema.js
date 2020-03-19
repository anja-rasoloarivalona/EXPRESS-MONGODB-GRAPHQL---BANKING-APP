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

    type Income {
        _id: ID!
        name: String!
        amount: Int!
        from: String!
        frequency: Frequency!
        lastPayout: String!
        nextPayout: String!
        autoWriting: Boolean!
        notification: Boolean!
        owner: String
    }

    input FrequencyInput {
        counter: String!
        period: String!
    }

    type Frequency {
        counter: String!
        period: String!
    }

    input IncomeInputData {
        name: String!
        amount: String!
        from: String!
        frequency: FrequencyInput!
        lastPayout: String!
        autoWriting: String!
        notification: String!
    }

    type Expense {
        _id: ID!
        name: String!
        amount: Int!
        used: Int
        category: String!
        expenseType: String!
        owner: String
    }

    input ExpenseInputData {
        name: String!
        amount: String!
        category: String!
        expenseType: String!
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

    input WalletInputData {
        walletType: String!
        supplier: String!
        amount: String!
        shortId: String
        color: String!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String!
        status: String!
        transactions: [Transaction!]
        wallets: [Wallet!]
        incomes: [Income!]
        expenses: [Expense!]
    }

    input UserInputData {
        email: String!
        name: String!
        password: String!
    }
    
 

    type RootMutation {
        createUser(userInput: UserInputData): AuthData!
        addWallet(walletInput: WalletInputData): Wallet!
        editWallet(walletId: String!, walletInput: WalletInputData!): Wallet!
        addIncome(incomeInput: IncomeInputData): Income!
        addExpense(expenseInput: ExpenseInputData): Expense!
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
