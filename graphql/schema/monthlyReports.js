export const types = `
    type MonthlyReport {
        period: String!
        income: Int
        expense: Int
        details: [MonthlyReportDetails]
        transactions: [Transaction]
    }

    type MonthlyReportDetails {
        category: String!
        subcategory: String!
        amount: Int!
        used: Int
        usedAmountInit: Int
    }
`;
