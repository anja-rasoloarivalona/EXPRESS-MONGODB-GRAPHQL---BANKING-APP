import User from '../../models/user'
import { dateRangeCalculator } from '../../utilities/DateRangeCalculator'
import { uuid } from 'uuidv4'


export default {
    addExpense: async function({ expenseInput}, req) {
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
        let newExpense
        const isExpenseFixed = expenseInput.expenseType === 'Fixed'
        const isExpenseVariable = expenseInput.expenseType === 'Variable'
        const expenseId = uuid()
        const newMonthlyReportBudget = {_id: expenseId}
        const d = new Date()
        const currentPeriod = `${d.getMonth() + 1}-${d.getFullYear()}`

        const newTransaction = {
            _id: uuid(),
            budgetId: expenseId,
            counterparty: '-',
            details: 'Initialization',
            usedWalletId: 'Unknown',
            status: 'paid',
            transactionType: 'expense'
        }

        const f = isExpenseVariable ? new Date() : new Date(expenseInput.lastPayout)
        const newTransactionPeriod = `${f.getMonth() + 1}-${f.getFullYear()}`

        // CREATE NEW EXPENSE
        if(isExpenseFixed){
            // New fixed expense
            let nextPayout = dateRangeCalculator(expenseInput.frequency, expenseInput.lastPayout)
            newExpense = {
                _id: expenseId,
                category: expenseInput.category,
                subcategory: expenseInput.subcategory,
                amount: parseInt(expenseInput.amount),
                expenseType: expenseInput.expenseType,
                lastPayout: expenseInput.lastPayout,
                nextPayout: nextPayout,
                frequency: expenseInput.frequency,
                color: expenseInput.color
            }
            newMonthlyReportBudget.amount = parseInt(expenseInput.amount)
        } else {
            // New variable expense
            newExpense = {
                _id: expenseId,
                category: expenseInput.category,
                subcategory: expenseInput.subcategory,
                amount: parseInt(expenseInput.amount),
                used: parseInt(expenseInput.used),
                currentPeriod: currentPeriod,
                expenseType: expenseInput.expenseType,
                frequency: {
                    counter: 'once',
                    period: 'a month'
                },
                color: expenseInput.color
            }
            newMonthlyReportBudget.amount = parseInt(expenseInput.amount)
            newMonthlyReportBudget.used = parseInt(expenseInput.used)
        }

        user.expenses.push(newExpense)

        // CREATE NEW TRANSACTION
        if(isExpenseFixed){
            // New fixed expense transaction
            newTransaction.date = expenseInput.lastPayout
            newTransaction.amount = parseInt(expenseInput.amount) * -1
        } else {
            // New variable expense transaction
            newTransaction.date = new Date().toLocaleDateString()
            newTransaction.amount = parseInt(expenseInput.used) * -1
        }

        // CREATE THE MONTHLY REPORT

        const expenseAmount = isExpenseVariable ? parseInt(expenseInput.used) : parseInt(expenseInput.amount)

        if(user.monthlyReports.length < 1 ){
            user.monthlyReports = [{
                period: newTransactionPeriod,
                income: 0,
                expense: expenseAmount,
                details: [newMonthlyReportBudget],
                transactions: [newTransaction]
            }]
        } else {
                const didFindReport = user.monthlyReports.find((report, index) => {
                    if(report.period === newTransactionPeriod){
                        user.monthlyReports[index].details.push(newMonthlyReportBudget)
                        user.monthlyReports[index].expense += expenseAmount
                        user.monthlyReports[index].transactions.push(newTransaction)
                        return true
                    }
                })
                if(!didFindReport){
                    user.monthlyReports.push({
                        period: newTransactionPeriod,
                        income: 0,
                        expense: expenseAmount,
                        details: [newMonthlyReportBudget],
                        transactions: [newTransaction]
                    })
                }    
        }

        await user.save()
        if(isExpenseFixed){
            newExpense.nextPayout = newExpense.nextPayout.toLocaleDateString()
        }
        return newExpense
    },

    editExpense: async function({expenseInput}, req) {
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

        let expenseIndex

        user.expenses.find( (expense, index) => {
            if(expense._id === expenseInput._id){
                expenseIndex = index
                if(expenseInput.expenseType === 'fixed'){
                    let nextPayout = dateRangeCalculator(expenseInput.frequency, expenseInput.lastPayout)
                    user.expenses[index] = {
                        _id: expense._id,
                        name: expenseInput.name,
                        amount: parseInt(expenseInput.amount),
                        category: expenseInput.category,
                        expenseType: expenseInput.expenseType,
                        lastPayout: expenseInput.lastPayout,
                        nextPayout: nextPayout,
                        frequency: expenseInput.frequency,
                        color: expenseInput.color
                    }
                } else {
                    user.expenses[index] = {
                        _id: expense._id,
                        name: expenseInput.name,
                        amount: parseInt(expenseInput.amount),
                        used: parseInt(expenseInput.used),
                        category: expenseInput.category,
                        currentPeriod: currentPeriod,
                        expenseType: expenseInput.expenseType,
                        frequency: {
                            counter: 'once',
                            period: 'a month'
                        },
                        color: expenseInput.color
                    }
                }
            }
        })
        await user.save()
        const res = user.expenses[expenseIndex]
        return res

        
    }
}