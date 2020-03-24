const User = require('../../models/user')
const Transaction = require('../../models/transaction')
const Wallet = require('../../models/wallet')
const mongoose = require('mongoose')
const Expense = require('../../models/expense')
const Income = require('../../models/income')
const dateRangeCalculator = require('../../utilities/DateRangeCalculator')

module.exports = {
    addTransaction: async function({transactionInput}, req) {
        console.log('addding')
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
        let transactionCounter = 0
        if(user.transactions && user.transactions.length > 0){
            transactionCounter = user.transactions.length
        }
        let amount = parseInt(transactionInput.amount)
        if(transactionInput.transactionType === 'expense'){
            amount = amount * -1
        }
        const newTransaction = new Transaction ({
            shortId: transactionCounter + 1,
            date: transactionInput.date,
            name: transactionInput.name,
            counterparty: transactionInput.counterparty,
            amount: amount,
            details: transactionInput.details,
            usedWallet: mongoose.Types.ObjectId(transactionInput.walletId),
            status: transactionInput.status,
            transactionType: transactionInput.transactionType,
            owner: req.userId
        })
        if (newTransaction.transactionType === 'expense'){
            newTransaction.category = transactionInput.category
        }
        await newTransaction.save()

        const d = new Date(transactionInput.date)
        const period = `${d.getMonth() + 1}-${d.getFullYear()}`

        if (newTransaction.transactionType === 'expense'){
            await this.addExpenseTransaction(transactionInput, newTransaction._id, period, amount)
        } else {
            await this.addIncomeTransaction(transactionInput, newTransaction._id, period, amount)
        }
        user.transactions.push(newTransaction._id)
        await user.save()
        const wallet = await Wallet.findById(transactionInput.walletId)
        wallet.transactions.push(newTransaction._id)
        wallet.amount += amount
        await wallet.save()

        const userResData = await User.findById(req.userId).populate('wallets incomes expenses').exec()
        const resData = {
            transaction: newTransaction, 
            wallets: userResData.wallets,
            incomes: userResData.incomes,
            expenses: userResData.expenses
        }
        return resData
    },

    addExpenseTransaction: async function(transactionInput, transactionId, period, amount){
        const editedExpense = await Expense.findOne({ 'name': transactionInput.name})
        const availableReports = []

        if(editedExpense.monthlyReport && editedExpense.monthlyReport.length > 0){
            editedExpense.monthlyReport.forEach(report => {
                availableReports.push(report.period)
        })
        }
        if (editedExpense.expenseType === 'fixed'){
            editedExpense.lastPayout = transactionInput.date
            editedExpense.nextPayout = dateRangeCalculator(editedExpense.frequency, transactionInput.date) 
                           
            if(availableReports.includes(period)){
                editedExpense.monthlyReport.find( (report, i) => {
                    if(report.period === period){
                        editedExpense.monthlyReport[i].amount -= amount
                        editedExpense.monthlyReport[i].transactions.push(transactionId)
                    }
                })
            } else {
                editedExpense.monthlyReport.push({
                    period: period,
                    amount: amount * -1,
                    transactions: [transactionId]
                })
            }                       
        } 
        if (editedExpense.expenseType === 'variable'){
            if(editedExpense.currentPeriod === period){
                editedExpense.used -= amount
            } 
            if(availableReports.includes(period)){
                editedExpense.monthlyReport.find( (report, i) => {
                    if(report.period === period){
                        editedExpense.monthlyReport[i].used -= amount
                        editedExpense.monthlyReport[i].transactions.push(transactionId)
                    }
                })
            } else {
                editedExpense.monthlyReport.push({
                    period: period,
                    amount: editedExpense.amount,
                    used: amount * -1,
                    transactions: [transactionId]
                })
            }
        }
        await editedExpense.save()
    },
    addIncomeTransaction: async function(transactionInput, transactionId, period, amount){
        const editedIncome = await Income.findOne({'name': transactionInput.name })

        editedIncome.lastPayout = transactionInput.date
        editedIncome.nextPayout = dateRangeCalculator(editedIncome.frequency, transactionInput.date)

        if(editedIncome.monthlyReport && editedIncome.monthlyReport.length > 0){
            const availableReports = []
            editedIncome.monthlyReport.forEach(report => {
                    availableReports.push(report.period)
            })
            if(availableReports.includes(period)){
                editedIncome.monthlyReport.find( (report, i) => {
                    if(report.period === period){
                        editedIncome.monthlyReport[i].amount += amount
                        editedIncome.monthlyReport[i].transactions.push(transactionId)
                    }
                })
            } else {
                editedIncome.monthlyReport.push({
                    period: period,
                    amount: amount,
                    transactions: [transactionId]
                })
            }
        } else {
            editedIncome.monthlyReport = [{
                period: period,
                amount: amount,
                transactions: [transactionId]
            }]
        }
        
        await editedIncome.save()
    }
}