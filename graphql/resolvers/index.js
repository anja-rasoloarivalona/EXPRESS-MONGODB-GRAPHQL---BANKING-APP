import Auth from './auth.js'
import Wallet from './wallet.js'
import Income from './income.js'
import Expense from './expense.js'
import Goal from './goal.js'
import Transaction from './transaction.js'
import Settings from './settings.js'

export default {
    ...Auth,
    ...Wallet,
    ...Income,
    ...Expense,
    ...Goal,
    ...Transaction,
    ...Settings
}