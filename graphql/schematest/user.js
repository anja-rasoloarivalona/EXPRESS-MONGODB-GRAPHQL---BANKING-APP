export const types = `
type User {
    _id: ID!
    name: String!
    email: String!
    status: String!
    monthlyReports: [MonthlyReports]
    wallets: [Wallet!]
    incomes: [Income!]
    expenses: [Expense!]
    goal: Goal
    settings: Settings
}
`;

export const queries = `
    user: User!
`;

export const inputs = `
    input UserInputData {
        email: String!
        name: String!
        password: String!
    }
`;

export const mutations = `
    createUser(userInput: UserInputData): AuthData!
    verifyUserCode(code: String!): String!
`