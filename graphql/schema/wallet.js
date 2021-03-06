export const types = `
    type Wallet {
        _id: String!
        walletType: String!
        name: String!
        amount: Int!
        creditLimit: Int
        color: String!
    }
`;

export const inputs = `
    input WalletInputData {
        _id: String
        walletType: String!
        name: String!
        amount: String!
        creditLimit: String
        color: String!
    }
`;

export const mutations = `
    addWallet(walletInput: WalletInputData): Wallet!
    editWallet(walletInput: WalletInputData!): Wallet!
`