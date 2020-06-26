export const types = `
    type DashboardLayoutItem {
        x: Int
        y: Int
        w: Int
        h: Int
        minW: Int
        minH: Int
        i: String
        displayed: Boolean
        ghostMode: String
    }
`;

export const inputs = `
    input DashboardLayoutItemInput {
        i: String
        x: String
        y: String
        w: String
        h: String
        displayed: String
    }
    input DashboardLayoutInputData {
        available: DashboardLayoutItemInput
        balance: DashboardLayoutItemInput
        budget: DashboardLayoutItemInput
        expenses: DashboardLayoutItemInput
        goal: DashboardLayoutItemInput
        history: DashboardLayoutItemInput
        monthly: DashboardLayoutItemInput
        transactions: DashboardLayoutItemInput
        wallet: DashboardLayoutItemInput
        calendar: DashboardLayoutItemInput
    }
`;