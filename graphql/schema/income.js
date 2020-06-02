export const types = `
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
`;

export const inputs = `
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
`;

export const mutations = `
    addIncome(incomeInput: IncomeInputData): Income!
    editIncome(incomeInput: IncomeInputData): Income!
`