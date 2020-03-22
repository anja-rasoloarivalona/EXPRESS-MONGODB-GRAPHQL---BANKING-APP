const Income = require('../../models/income');
const User = require('../../models/user');

module.exports = {
    addIncome: async function({ incomeInput}, req) {
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
        let autoWriting, notification;

        if(incomeInput.autoWriting === 'yes'){
            autoWriting = true
        } else {
            autoWriting = false
        }

        if(incomeInput.notification === 'yes'){
            notification = true
        } else {
            notification = false
        }

        let nextPayout = dateRangeCalculator(incomeInput.frequency, incomeInput.lastPayout)

        const newIncome = new Income ({
            name: incomeInput.name,
            amount: parseInt(incomeInput.amount),
            from: incomeInput.from,
            frequency: incomeInput.frequency,
            lastPayout: incomeInput.lastPayout,
            nextPayout: nextPayout,
            autoWriting: autoWriting,
            notification: notification,
            owner: req.userId
        })
        await newIncome.save()
        user.incomes.push(newIncome)
        await user.save()
        return newIncome
    },
}