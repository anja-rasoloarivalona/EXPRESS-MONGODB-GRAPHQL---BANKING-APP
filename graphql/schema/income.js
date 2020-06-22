export const types = `
    type Income {
        _id: String!
        category: String!
        subcategory: String!
        amount: Int!
        frequency: Frequency!
        lastPayout: String!
        nextPayout: String!
        autoWriting: Boolean!
        notification: Boolean!
        details: String
        color: String
    }
`;

export const inputs = `
    input IncomeInputData {
        _id: String
        category: String!
        amount: String!
        frequency: FrequencyInput!
        lastPayout: String!
        autoWriting: String!
        notification: String!
        color: String
        details: String
    }
`;

export const mutations = `
    addIncome(incomeInput: IncomeInputData): Income!
    editIncome(incomeInput: IncomeInputData): Income!
`