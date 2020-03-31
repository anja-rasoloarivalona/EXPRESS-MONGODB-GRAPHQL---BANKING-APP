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
        color: String
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
        _id: String
        name: String!
        amount: String!
        from: String!
        frequency: FrequencyInput!
        lastPayout: String!
        autoWriting: String!
        notification: String!
        color: String!
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
        color: String
    }

    input ExpenseInputData {
        _id: String
        name: String!
        amount: String!
        used: String
        category: String!
        expenseType: String!
        lastPayout: String
        nextPayout: String
        frequency: FrequencyInput
        color: String
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
        creditLimit: Int
        shortId: String
        color: String!
    }

    input WalletInputData {
        _id: String
        walletType: String!
        supplier: String!
        amount: String!
        creditLimit: String
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

    type RootMutation {
        createUser(userInput: UserInputData): AuthData!
        addWallet(walletInput: WalletInputData): Wallet!
        editWallet(walletInput: WalletInputData!): Wallet!
        addIncome(incomeInput: IncomeInputData): Income!
        editIncome(incomeInput: IncomeInputData): Income!
        addExpense(expenseInput: ExpenseInputData): Expense!
        editExpense(expenseInput: ExpenseInputData): Expense!
        addGoal(goalInput: UserGoalInputData): Goal!
        
        addTransaction(transactionInput: TransactionInput): User!
        deleteTransaction(transactionInput: TransactionInput): User!
        editTransaction(transactionInput: TransactionInput): User!
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
