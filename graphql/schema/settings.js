export const types = `
    type Settings {
        dashboardLayout: [DashboardLayoutItem]
        theme: String
        currency: String
    }
`;

export const mutations = `
    setTheme(theme: String!): User!
    updateDashboardLayout(input: DashboardLayoutInputData): [DashboardLayoutItem]
    setCurrency(currency: String!): String 
`
