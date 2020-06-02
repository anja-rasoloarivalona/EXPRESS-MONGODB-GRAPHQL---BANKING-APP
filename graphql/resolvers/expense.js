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
        const isExpenseFixed = expenseInput.expenseType === 'fixed'
        const isExpenseVariable = expenseInput.expenseType === 'variable'
        const expenseId = uuid()
        const newMonthlyReportBudget = {_id: expenseId}
        const d = new Date()
        const currentPeriod = `${d.getMonth() + 1}-${d.getFullYear()}`

        if(isExpenseFixed){
            let nextPayout = dateRangeCalculator(expenseInput.frequency, expenseInput.lastPayout)
            newExpense = {
                _id: expenseId,
                name: expenseInput.name,
                amount: parseInt(expenseInput.amount),
                category: expenseInput.category,
                expenseType: expenseInput.expenseType,
                lastPayout: expenseInput.lastPayout,
                nextPayout: nextPayout,
                frequency: expenseInput.frequency,
                color: expenseInput.color
            }
            newMonthlyReportBudget.amount = parseInt(expenseInput.amount)
        } else {
            newExpense = {
                _id: expenseId,
                name: expenseInput.name,
                amount: parseInt(expenseInput.amount),
                used: parseInt(expenseInput.used),
                currentPeriod: currentPeriod,
                category: expenseInput.category,
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

        if(user.monthlyReports.length < 1 ){
            user.monthlyReports = [{
                period: currentPeriod,
                income: 0,
                expense: isExpenseVariable ? parseInt(expenseInput.used) : 0,
                budget: [newMonthlyReportBudget]
            }]
        } else {
            if(isExpenseVariable){
                const didFindReport = user.monthlyReports.find((report, index) => {
                    if(report.period === currentPeriod){
                        user.monthlyReports[index].budget.push(newMonthlyReportBudget)
                        user.monthlyReports[index].expense += parseInt(expenseInput.used)
                        return true
                    }
                })
                if(!didFindReport){
                    user.monthlyReports.push({
                        period: currentPeriod,
                        income: 0,
                        expense: parseInt(expenseInput.used),
                        budget: [newMonthlyReportBudget]
                    })
                }    
            }
        }

        await user.save()
        if(expenseInput.expenseType === 'fixed'){
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