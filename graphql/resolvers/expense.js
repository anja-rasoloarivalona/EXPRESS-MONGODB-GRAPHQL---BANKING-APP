import User from '../../models/user.js'
import { dateRangeCalculator } from '../../utilities/DateRangeCalculator.js'
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
        const expenseAmount = parseInt(expenseInput.amount)
        const expenseUsed = parseInt(expenseInput.used)
        const expenseId = expenseInput._id && expenseInput._id !== 'undefined'? expenseInput._id : uuid()

        const d = new Date()
        const currentPeriod = `${d.getMonth() + 1}-${d.getFullYear()}`


        // CREATE NEW EXPENSE
        if(isExpenseFixed){
            newExpense = {
                _id: expenseId,
                category: expenseInput.category,
                subcategory: expenseInput.subcategory,
                amount: expenseAmount,
                expenseType: expenseInput.expenseType,
                lastPayout: expenseInput.lastPayout,
                nextPayout: dateRangeCalculator(expenseInput.frequency, expenseInput.lastPayout),
                frequency: expenseInput.frequency,
                color: expenseInput.color
            }
            user.expenses.push(newExpense)
        }
            
        if(isExpenseVariable){
            newExpense = {
                _id: expenseId,
                category: expenseInput.category,
                subcategory: expenseInput.subcategory,
                amount: expenseAmount,
                used: expenseUsed,
                currentPeriod: currentPeriod,
                expenseType: expenseInput.expenseType,
                frequency: {
                    counter: 'once',
                    period: 'a month'
                },
                color: expenseInput.color
            }
            user.expenses.push(newExpense)

            const newMonthlyReportDetail = {
                category: expenseInput.category,
                subcategory: expenseInput.subcategory,
                amount: expenseAmount,
                used: expenseUsed,
            }

            if(user.status === 'setup'){
                newMonthlyReportDetail.usedAmountInit = expenseUsed
            } else {
                if(!expenseInput.alreadyUsedThisCurrentMonth){
                    newMonthlyReportDetail.usedAmountInit = expenseUsed
                } else {
                    newMonthlyReportDetail.usedAmountInit = 0
                }
            }

            const newMonthlyReport = {
                period: currentPeriod,
                income: 0,
                expense: expenseUsed,
                details: [newMonthlyReportDetail],
                transactions: []
            }

            if(user.monthlyReports.length < 1){
                user.monthlyReports = [newMonthlyReport]
            } else {
                const didFindReportWithCurrentPeriod = user.monthlyReports.find((report, index) => {
                    if(report.period === currentPeriod){
                        user.monthlyReports[index].expense += expenseUsed
                       const didFindDetail = user.monthlyReports[index].details.find((detail, dIndex) => {
                            if(detail.category === expenseInput.category && detail.subcategory === expenseInput.subcategory){
                                user.monthlyReports[index].details[dIndex].amount = expenseAmount
                                user.monthlyReports[index].details[dIndex].used = expenseUsed
                                if(user.status === 'setup'){
                                    user.monthlyReports[index].details[index].usedAmountInit = expenseUsed
                                }
                                return true
                            }
                        })
                        if(!didFindDetail){
                            user.monthlyReports[index].details.push(newMonthlyReportDetail)
                        }
                        return true
                    }
                })
                if(!didFindReportWithCurrentPeriod){
                    user.monthlyReports.push(newMonthlyReport)
                }
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
        const deleting = await this.deleteExpense({ expenseInputId: expenseInput._id }, req)
        let addedExpense
        if(deleting.success){
            const data = { expenseInput: expenseInput }
            addedExpense = await this.addExpense(data, req)
        }
        return addedExpense
    },

    deleteExpense: async function({expenseInputId}, req){
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

        let deletedExpense
        user.expenses.find((expense, index) => {
            if(expense._id === expenseInputId){
                deletedExpense = user.expenses[index]
                return true
            }
        })

        user.expenses = user.expenses.filter(expense => expense._id !== expenseInputId)

        if(deletedExpense.expenseType === 'Variable'){
            const d = new Date()
            const currentPeriod = `${d.getMonth() + 1}-${d.getFullYear()}`
            user.monthlyReports.find((report, index) => {
                if(report.period === currentPeriod){
                    let deleteDetail = false
                    user.monthlyReports[index].details.find((detail, dIndex) => {
                        if(detail.category === deletedExpense.category && detail.subcategory === deletedExpense.subcategory && detail.usedAmountInit !== 0){
                            user.monthlyReports[index].expense -= detail.usedAmountInit
                            if(detail.used === detail.usedAmountInit){
                                deleteDetail = true
                            } else {
                                user.monthlyReports[index].details[dIndex].amount = user.monthlyReports[index].details[dIndex].used - user.monthlyReports[index].details[dIndex].usedAmountInit
                                user.monthlyReports[index].details[dIndex].used = null
                                user.monthlyReports[index].details[dIndex].usedAmountInit = null
                            }
                            return true
                        }
                    })
                    if(deleteDetail){
                        const newDetails = user.monthlyReports[index].details.filter(detail => detail.category !== deletedExpense.category && detail.subcategory !== deletedExpense.subcategory)
                        user.monthlyReports[index].details = newDetails
                    }
                }
                return true
            })
        }
        await user.save()
        return {
            success: true,
            deletedId: expenseInputId
        }
    }
}