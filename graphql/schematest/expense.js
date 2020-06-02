export const types = `
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
        currentPeriod: String
    }
`;

export const inputs = `
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
`;

export const mutations = `
    addExpense(expenseInput: ExpenseInputData): Expense!
    editExpense(expenseInput: ExpenseInputData): Expense!
`