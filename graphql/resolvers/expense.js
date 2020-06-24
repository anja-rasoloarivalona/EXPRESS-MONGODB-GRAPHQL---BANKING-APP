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
        const expenseAlreadyExists = user.expenses.find(expense => {
            if(expense.category === expenseInput.category && expense.subcategory === expenseInput.subcategory){
                return true
            }
        })
        if(expenseAlreadyExists){
            const error = new Error('This expenditure has already been budgeted.')
            error.code = 401
            throw error
        }

        let newExpense
        const isExpenseFixed = expenseInput.expenseType === 'Fixed'
        const isExpenseVariable = expenseInput.expenseType === 'Variable'
        const expenseId = uuid()
        const newMonthlyReportDetail = {
            category: expenseInput.category,
            subcategory: expenseInput.subcategory,
        }
        const d = new Date()
        const currentPeriod = `${d.getMonth() + 1}-${d.getFullYear()}`
        let lastPayoutPeriod = null
        const expenseAlreadyUsedThisMonth = expenseInput.alreadyUsedThisCurrentMonth === 'true' ? true : false
        // console.log('expenseAlreadyUsedThisMonth', expenseAlreadyUsedThisMonth)

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
            // set last payout period
            const lastPayoutDate = new Date(expenseInput.lastPayout)
            lastPayoutPeriod = `${lastPayoutDate.getMonth() + 1}-${lastPayoutDate.getFullYear()}`

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
            // set amount and used -- to be modified
            newMonthlyReportDetail.amount = parseInt(expenseInput.amount)
            newMonthlyReportDetail.used = parseInt(expenseInput.used)
        }
        user.expenses.push(newExpense)

        // CREATE THE MONTHLY REPORT
        const expenseAmount = isExpenseVariable ? parseInt(expenseInput.used) : parseInt(expenseInput.amount)
        const newMonthlyReport = {
            period: isExpenseVariable ? currentPeriod : lastPayoutPeriod,
            income: 0,
            expense: expenseAmount,
            details: [newMonthlyReportDetail],
            transactions: []
        }
        if(user.monthlyReports.length < 1 ){
            user.monthlyReports = [newMonthlyReport]
        } else {
            const didFindReport = user.monthlyReports.find((report, index) => {
                if(report.period === newMonthlyReport.period){
                    // to be modified = doesnt not work - ne need to push smonthing that already exists
                    // change details amount and used if variable
                    if(expenseAlreadyUsedThisMonth){
                        console.log('expense already used')
                        user.monthlyReports[index].details.find( (detail, dIndex) => {
                            if(detail.category === expenseInput.category && detail.subcategory === expenseInput.subcategory){
                                user.monthlyReports[index].details[dIndex].used = newMonthlyReportDetail.used
                                user.monthlyReports[index].details[dIndex].amount = newMonthlyReportDetail.amount
                                return true
                            }
                        })
                    } else {
                        user.monthlyReports[index].details.push(newMonthlyReportDetail)
                        user.monthlyReports[index].expense += expenseAmount
                    }
                    return true
                }
            })
            if(!didFindReport){
                user.monthlyReports.push(newMonthlyReport)
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