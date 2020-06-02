export const types = `
    type Settings {
        dashboardLayout: [DashboardLayoutItem]
        theme: String
    }
`;

export const mutations = `
    setTheme(theme: String!): User!
    updateDashboardLayout(input: DashboardLayoutInputData): [DashboardLayoutItem] 
`
