import User from '../../models/user'
import { uuid } from 'uuidv4'

export default {
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

        console.log(nextPayout)
        const newIncome = {
            _id: uuid(),
            name: incomeInput.name,
            amount: parseInt(incomeInput.amount),
            from: incomeInput.from,
            frequency: incomeInput.frequency,
            lastPayout: incomeInput.lastPayout,
            nextPayout: nextPayout,
            autoWriting: autoWriting,
            notification: notification,
            color: incomeInput.color
        }
        user.incomes.push(newIncome)
        await user.save()
        
        newIncome.nextPayout = newIncome.nextPayout.toLocaleDateString()
        return newIncome
    },

    editIncome: async function ({ incomeInput}, req) {
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

        let incomeIndex

        user.incomes.find( (income, index) => {
            if(income._id === incomeInput._id){
                incomeIndex = index
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
                user.incomes[index] = {
                    _id: incomeInput._id,
                    name: incomeInput.name,
                    amount: parseInt(incomeInput.amount),
                    from: incomeInput.from,
                    frequency: incomeInput.frequency,
                    lastPayout: incomeInput.lastPayout,
                    nextPayout: nextPayout,
                    autoWriting: autoWriting,
                    notification: notification,
                    color: incomeInput.color
                }
            }
        })
        await user.save()
        const res = user.incomes[incomeIndex]
        return res

    }
}