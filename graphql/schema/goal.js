export const types = `
    type Goal {
        amount: Int
        date: String
    }
`;

export const inputs = `
    input UserGoalInputData {
        amount: String!
        date: String!
    }
`;

export const mutations = `
    addGoal(goalInput: UserGoalInputData): Goal!
`