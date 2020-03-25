const { buildSchema } = require('graphql')

module.exports = buildSchema(`
    type Transaction {
        _id: String!
        shortId: String!
        date: String!
        name: String!
        counterparty: String
        amount: Int!
        details: String!
        usedWalletId: String!
        status: String!
        transactionType: String!
        category: String,
    }

    input TransactionInput {
        _id: String
        date: String!
        name: String!
        counterparty: String
        amount: String!
        details: String!
        usedWalletId: String!
        status: String!
        transactionType: String!
        category: String
    }

    type MonthlyReports {
        period: String!
        income: Int
        expense: Int
        transactions: [Transaction]
    }

    type Income {
        _id: String!
        name: String!
        amount: Int!
        from: String!
        frequency: Frequency!
        lastPayout: String!
        nextPayout: String!
        autoWriting: Boolean!
        notification: Boolean!
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
        _id: String!
        name: String!
        amount: Int!
        used: Int
        lastPayout: String
        nextPayout: String
        frequency: Frequency
        category: String!
        expenseType: String!
    }

    input ExpenseInputData {
        name: String!
        amount: String!
        used: String
        category: String!
        expenseType: String!
        lastPayout: String
        nextPayout: String
        frequency: FrequencyInput
    }



    type AuthData {
        token: String!
        user: User!
    }

    type Wallet {
        _id: String!
        walletType: String!
        supplier: String!
        amount: Int!
        shortId: String
        color: String!
        owner: String!
        transactions: [Transaction]
    }

    input WalletInputData {
        _id: String
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
        monthlyReports: [MonthlyReports]
        wallets: [Wallet!]
        incomes: [Income!]
        expenses: [Expense!]
        goal: Goal
    }

    type Goal {
        name: String!
        amount: Int!
        date: String!
    }

    input UserGoalInputData {
        name: String!
        amount: String!
        date: String!
    }

    input UserInputData {
        email: String!
        name: String!
        password: String!
    }

    type TransactionResultData {
        transaction: Transaction!
        wallets: [Wallet!]
        incomes: [Income!]
        expenses: [Expense!]
    }
    
 

    type RootMutation {
        createUser(userInput: UserInputData): AuthData!
        addWallet(walletInput: WalletInputData): Wallet!
        editWallet(walletInput: WalletInputData!): Wallet!
        addIncome(incomeInput: IncomeInputData): Income!
        addExpense(expenseInput: ExpenseInputData): Expense!
        addGoal(goalInput: UserGoalInputData): Goal!
        addTransaction(transactionInput: TransactionInput): TransactionResultData!
        editTransaction(transactionInput: TransactionInput): TransactionResultData!
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
