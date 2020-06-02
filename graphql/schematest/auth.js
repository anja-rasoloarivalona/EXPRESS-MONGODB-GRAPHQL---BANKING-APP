export const types = `
    type AuthData {
        token: String!
        user: User!
    }
`;

export const queries = `
    login(email: String!, password: String!): AuthData!
    sendCodeToResetPassword(email: String!): String!
    verifyResetPasswordCode(email: String!, code: String!): String!
`

export const mutations = `
    resetPassword(email: String!, password: String!, token: String!): String!
`
