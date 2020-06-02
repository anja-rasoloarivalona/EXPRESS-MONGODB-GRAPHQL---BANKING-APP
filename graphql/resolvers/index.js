import Auth from './auth'
import Wallet from './wallet'
import Income from './income'
import Expense from './expense'
import Goal from './goal'
import Transaction from './transaction'
import Settings from './settings'

export default {
    ...Auth,
    ...Wallet,
    ...Income,
    ...Expense,
    ...Goal,
    ...Transaction,
    ...Settings
}