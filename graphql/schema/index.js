import * as Auth from './auth.js'
import * as Dashboard from './dashboard.js'
import * as Expense from './expense.js'
import * as Goal from './goal.js'
import * as Income from './income.js'
import * as MonthlyReports from './monthlyReports.js'
import * as Settings from './settings.js'
import * as Transaction from './transaction.js'
import * as User from './user.js'
import * as Utility from './utility.js'
import * as Wallet from './wallet.js'
import { buildSchema } from 'graphql'

const types = []
const inputs = []
const queries = []
const mutations = []

const schemas = [Auth, Dashboard, Expense, Goal, Income, MonthlyReports, Settings, Transaction, User, Utility, Wallet]

schemas.forEach(schema => {
    types.push(schema.types)
    queries.push(schema.queries)
    mutations.push(schema.mutations)
    inputs.push(schema.inputs)
})

export default buildSchema(`
    ${types.join('\n')}

    ${inputs.join('\n')}

    type RootMutation {
        ${mutations.join('\n')}
    }

    type RootQuery {
        ${queries.join('\n')}
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`)