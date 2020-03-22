const Expense = require('../../models/expense')
const User = require('../../models/user');
const dateRangeCalculator = require('../../utilities/DateRangeCalculator');

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
            newExpense = new Expense ({
                name: expenseInput.name,
                amount: parseInt(expenseInput.amount),
                category: expenseInput.category,
                expenseType: expenseInput.expenseType,
                lastPayout: expenseInput.lastPayout,
                nextPayout: nextPayout,
                owner: req.userId,
                frequency: expenseInput.frequency,
            })
        } else {
            newExpense = new Expense ({
                name: expenseInput.name,
                amount: parseInt(expenseInput.amount),
                used: parseInt(expenseInput.used),
                category: expenseInput.category,
                expenseType: expenseInput.expenseType,
                owner: req.userId,
                frequency: {
                    counter: 'once',
                    period: 'a month'
                }
            })
        }
        await newExpense.save()
        user.expenses.push(newExpense)
        await user.save()
        return newExpense
    },
}