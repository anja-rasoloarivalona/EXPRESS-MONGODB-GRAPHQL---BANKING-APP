export const types = `
    type Expense {
        _id: String!
        category: String!
        subcategory: String!
        amount: Int!
        used: Int
        lastPayout: String
        nextPayout: String
        frequency: Frequency
        expenseType: String!
        color: String
        currentPeriod: String
    }
`;

export const inputs = `
    input ExpenseInputData {
        _id: String
        category: String!
        subcategory: String!
        amount: String!
        used: String
        expenseType: String!
        lastPayout: String
        nextPayout: String
        frequency: FrequencyInput
        color: String
        alreadyUsedThisCurrentMonth: String
    }
`;

export const mutations = `
    addExpense(expenseInput: ExpenseInputData): Expense!
    editExpense(expenseInput: ExpenseInputData): Expense!
`