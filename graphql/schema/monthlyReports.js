export const types = `
    type MonthlyReport {
        period: String!
        income: Int
        expense: Int
        details: [MonthlyReportDetails]
        transactions: [Transaction]
    }

    type MonthlyReportDetails {
        _id: String!
        amount: Int!
        used: Int
    }
`;
