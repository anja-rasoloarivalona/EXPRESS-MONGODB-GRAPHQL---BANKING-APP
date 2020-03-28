const User = require('../../models/user')
const dateRangeCalculator = require('../../utilities/DateRangeCalculator')
const { uuid } = require('uuidv4')

module.exports = {
    editTransaction: async function({transactionInput}, req) {
        let data = {
            transactionInput: {...transactionInput, isEditing: true}
        }
        const res = await this.deleteTransaction(data, req)
        return res
    },
    addTransaction: async function({transactionInput}, req) {
        if(!req.isAuth) {
            const error = new Error('Not authenticated.')
            error.code = 401;
            throw error
        }
        const user = await User.findById(req.userId)
        if(!user) {
            const error = new Error('User not found.')
            error.code = 401;
            throw error
        }

        // DETERMINE THE TRANSACTION TYPE
        let isIncome = false
        let isExpense = false
        if (transactionInput.transactionType === 'expense'){
            isExpense = true
        } else {
            isIncome = true
        }

        // PREPARE AMOUNT DATA
        const amount = parseInt(transactionInput.amount)

        // CALCULATE THE NEW TRANSACTION RANK
        let rank = 0

        if(!transactionInput.deletedTransaction_shortId){
            if(user.monthlyReports.length > 0){
                user.monthlyReports.forEach(report => {
                    rank += report.transactions.length
                })
            }
        } else {
            rank = transactionInput.deletedTransaction_shortId
        }
        
        // CREATE THE TRANSACTION
        const newTransaction = {
            _id: transactionInput.deletedTransaction_shortId ? transactionInput.deletedTransaction_id : uuid(),
            shortId: transactionInput.deletedTransaction_shortId ? rank : rank + 1,
            date: transactionInput.date,
            name: transactionInput.name,
            counterparty: transactionInput.counterparty,
            amount: isIncome ? amount : amount * -1,
            details: transactionInput.details,
            usedWalletId: transactionInput.usedWalletId,
            status: transactionInput.status,
            transactionType: transactionInput.transactionType,
            owner: req.userId
        }

        // ADD A CATEGORY FIELD FOR EXPENSES
        if (isExpense){
            newTransaction.category = transactionInput.category
        }

        // CREATE THE PERIOD
        const d = new Date(transactionInput.date)
        const period = `${d.getMonth() + 1}-${d.getFullYear()}`

        // CHECK IF WE ALREADY HAVE MONTHLY REPORTS
        if(user.monthlyReports.length < 1){
            // CREATE NEW ONE
            user.monthlyReports = [{
                period: period,
                income: isIncome ? amount : 0,
                expense: isExpense ? amount: 0,
                transactions: [newTransaction]
            }]
        } else {
           const didFindReport = user.monthlyReports.find( (report, index) => {
                if(report.period === period){
                    user.monthlyReports[index].transactions.push(newTransaction)
                    if(isIncome){
                        user.monthlyReports[index].income += amount
                    } else {
                        user.monthlyReports[index].expense += amount
                    }
                    return true
                }
            })
            if(!didFindReport){
                user.monthlyReports.push({
                    period: period,
                    income: isIncome ? amount : 0,
                    expense: isExpense ? amount: 0,
                    transactions: [newTransaction]
                })
            }
        }

        // UPDATE THE USED WALLET
        user.wallets.find( (wallet, index) => {
            if(wallet._id === transactionInput.usedWalletId){
                if(isIncome){
                    user.wallets[index].amount += amount
                }
                if(isExpense){
                    user.wallets[index].amount -= amount 
                }
                return true
            }
        })

        // UPDATE INCOME DATE IF INCOME
        if(isIncome){
            user.incomes.find( (income, index) => {
                if(income.name === transactionInput.name){
                    user.incomes[index].lastPayout = transactionInput.date
                    user.incomes[index].nextPayout = dateRangeCalculator(income.frequency, transactionInput.date).toLocaleDateString() 
                    return true
                }
            })
        }

        // UPDATE EXPENSE DATA IF EXPENSE
        if(isExpense){
            let isFixed = false
            let isVariable = false
            user.expenses.find( (expense, index) => {
                if(expense.name === transactionInput.name){
                    if(user.expenses[index].expenseType === 'variable'){
                        isVariable = true
                    } else {
                        isFixed = true
                    }

                    if(isFixed){
                        user.expenses[index].lastPayout = transactionInput.date
                        user.expenses[index].nextPayout = dateRangeCalculator(expense.frequency, transactionInput.date).toLocaleDateString()
                    }
                    if(isVariable){
                        if(user.expenses[index].currentPeriod === period){
                            user.expenses[index].used += amount
                        }        
                    }
                }
            })
        }

       const userResData = await user.save()
        return userResData
    },

    deleteTransaction: async function({ transactionInput}, req) {
        if(!req.isAuth) {
            const error = new Error('Not authenticated.')
            error.code = 401;
            throw error
        }
        const user = await User.findById(req.userId)
        if(!user) {
            const error = new Error('User not found.')
            error.code = 401;
            throw error
        }

        let isEditing = false
        if(transactionInput.isEditing){
            isEditing = true
        }
    
        let deletedTransaction, iReport, iTransaction;
        let isIncome = false
        let isExpense = false

        user.monthlyReports.forEach( (report, indexReport) => {
            report.transactions.find( (transaction, indexTransaction) => {
                if(transaction._id === transactionInput._id){

                    console.log('III', indexReport)

                   deletedTransaction = user.monthlyReports[indexReport].transactions[indexTransaction]
                   if(deletedTransaction.transactionType === 'income'){
                       isIncome = true
                   } else {
                       isExpense = true
                   }
                   iReport = indexReport
                   iTransaction = indexTransaction 
                   return true
                }
            })
        })

        const dp = new Date(deletedTransaction.date)
        const deletedTransactionPeriod = `${dp.getMonth() + 1}-${dp.getFullYear()}`

        // CANCEL TRANSACTION IN EITHER INCOME OR EXPENSE
        if(isIncome){
            // rollsback income
            user.incomes.find( (income, index) => {
                if(income.name === deletedTransaction.name){
                    user.incomes[index].nextPayout = user.incomes[index].lastPayout
                    user.incomes[index].lastPayout = dateRangeCalculator(user.incomes[index].frequency, user.incomes[index].lastPayout, true)
                    return true
                }
            })
            // CANCEL THE AMOUNT IN WALLET
            user.wallets.find((wallet, index) => {
                if(wallet._id === deletedTransaction.usedWalletId){
                    user.wallets[index].amount -= deletedTransaction.amount
                }
            })
            // CANCEL TRANSACTION IN MONTHLY REPORTS
            user.monthlyReports[iReport].income -= deletedTransaction.amount

        }
        if(isExpense){
            // rollback expense
            user.expenses.find( (expense, index) => {
                if(expense.name === deletedTransaction.name){
                    if(expense.expenseType === 'variable' && user.expenses[index].currentPeriod === deletedTransactionPeriod){
                        user.expenses[index].used += deletedTransaction.amount
                    }

                    if(expense.expenseType === 'fixed'){
                        user.expenses[index].nextPayout = user.expenses[index].lastPayout
                        user.expenses[index].lastPayout = dateRangeCalculator(user.expenses[index].frequency, user.expenses[index].lastPayout, true)
                    }
                    return true
                }
            })
            // CANCEL THE AMOUNT IN WALLET
            user.wallets.find((wallet, index) => {
                if(wallet._id === deletedTransaction.usedWalletId){
                    user.wallets[index].amount -= deletedTransaction.amount
                }
            })

            // CANCEL TRANSACTION IN MONTHLY REPORTS
            user.monthlyReports[iReport].expense +=deletedTransaction.amount
        }


        // DELETE TRANSACTION FROM THE REPORT
        user.monthlyReports[iReport].transactions = user.monthlyReports[iReport].transactions.filter(transaction => transaction._id !== deletedTransaction._id)
        const res = await user.save()


        // CHECK IF WE ARE EDITING
        if(isEditing){
            // Pass on all the correct data for the new transaction to be added 
            let amount = transactionInput.amount
            if(transactionInput.transactionType === 'expense' && amount > 0){
                amount = amount * -1
            }
            if(transactionInput.transactionType === 'income' && amount < 0){
                amount = amount * -1
            }

            const data = {
                transactionInput : {
                    ...transactionInput,
                    amount: amount,
                    deletedTransaction_id: deletedTransaction._id,
                    deletedTransaction_shortId: deletedTransaction.shortId
                }
            }
           const res = await this.addTransaction(data, req)
           return res
        } else {
            return res
        }
    }
}