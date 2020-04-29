const User = require('../../models/user');
const dateRangeCalculator = require('../../utilities/DateRangeCalculator');
const { uuid } = require('uuidv4')

module.exports = {
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

        console.log('input', expenseInput)

        let newExpense

        if(expenseInput.expenseType === 'fixed'){
            let nextPayout = dateRangeCalculator(expenseInput.frequency, expenseInput.lastPayout)
            newExpense = {
                _id: uuid(),
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
            const d = new Date()
            const period = `${d.getMonth() + 1}-${d.getFullYear()}`
            newExpense = {
                _id: uuid(),
                name: expenseInput.name,
                amount: parseInt(expenseInput.amount),
                used: parseInt(expenseInput.used),
                period: period,
                category: expenseInput.category,
                expenseType: expenseInput.expenseType,
                frequency: {
                    counter: 'once',
                    period: 'a month'
                },
                color: expenseInput.color
            }
        }
        user.expenses.push(newExpense)
        await user.save()
        if(expenseInput.expenseType === 'fixed'){
            newExpense.nextPayout = newExpense.nextPayout.toLocaleDateString()
        }
        return newExpense
    },

    editExpense: async function({expenseInput}, req) {
        console.log('expensein', expenseInput)
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
                        name: expense.name,
                        amount: parseInt(expenseInput.amount),
                        category: expenseInput.category,
                        expenseType: expenseInput.expenseType,
                        lastPayout: expenseInput.lastPayout,
                        nextPayout: nextPayout,
                        frequency: expenseInput.frequency,
                        color: expenseInput.color
                    }
                } else {
                    const d = new Date()
                    const period = `${d.getMonth() + 1}-${d.getFullYear()}`
                    user.expenses[index] = {
                        _id: expense._id,
                        name: expenseInput.name,
                        amount: parseInt(expenseInput.amount),
                        used: parseInt(expenseInput.used),
                        category: expenseInput.category,
                        period: period,
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