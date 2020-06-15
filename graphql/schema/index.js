import * as Auth from './auth'
import * as Dashboard from './dashboard'
import * as Expense from './expense'
import * as Goal from './goal'
import * as Income from './income'
import * as MonthlyReports from './monthlyReports'
import * as Settings from './settings'
import * as Transaction from './transaction'
import * as User from './user'
import * as Utility from './utility'
import * as Wallet from './wallet'
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