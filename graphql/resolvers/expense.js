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
                owner: req.userId,
                frequency: expenseInput.frequency,
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
                owner: req.userId,
                frequency: {
                    counter: 'once',
                    period: 'a month'
                }
            }
        }
        user.expenses.push(newExpense)
        await user.save()
        if(expenseInput.expenseType === 'fixed'){
            newExpense.nextPayout = newExpense.nextPayout.toLocaleDateString()
        }
        return newExpense
    },
}