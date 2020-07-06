export const types = `
    type Transaction {
        _id: String!
        category: String!
        subcategory: String!
        date: String!
        counterparty: String!
        amount: Int!
        details: String!
        usedWalletId: String!
        transactionType: String!
        status: String
    }
`;

export const inputs = `
    input TransactionInput {
        _id: String
        category: String!
        subcategory: String!
        date: String!
        counterparty: String
        amount: String!
        details: String
        usedWalletId: String!
        transactionType: String!
    }
    input TransactionId {
        _id: String!
    }
`;

export const mutations = `
    addTransaction(transactionInput: TransactionInput): User!
    deleteTransaction(transactionInput: TransactionId): User!
    editTransaction(transactionInput: TransactionInput): User!
`
