export const types = `
    type MonthlyReports {
        period: String!
        income: Int
        expense: Int
        details: [MonthlyReportsDetail]
        transactions: [Transaction]
    }

    type MonthlyReportsDetail {
        _id: String!
        amount: Int!
        used: Int
    }
`;
