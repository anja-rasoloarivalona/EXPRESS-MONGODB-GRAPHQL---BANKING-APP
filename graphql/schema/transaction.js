export const types = `
    type Transaction {
        _id: String!
        budgetId: String!
        date: String!
        counterparty: String!
        amount: Int!
        details: String!
        usedWalletId: String!
        status: String!
        transactionType: String!
    }
`;

export const inputs = `
    input TransactionInput {
        _id: String
        name: String
        budgetId: String!
        date: String!
        counterparty: String
        amount: String!
        details: String
        usedWalletId: String!
        status: String!
        transactionType: String!
    }
`;

export const mutations = `
    addTransaction(transactionInput: TransactionInput): User!
    deleteTransaction(transactionInput: TransactionInput): User!
    editTransaction(transactionInput: TransactionInput): User!
`
