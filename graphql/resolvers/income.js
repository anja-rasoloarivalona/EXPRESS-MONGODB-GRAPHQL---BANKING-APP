import User from '../../models/user'
import { dateRangeCalculator } from '../../utilities/DateRangeCalculator'
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
        const incomeAlreadyExists = user.incomes.find(income => {
            if(income.subcategory === incomeInput.category){
                return true
            }
        })
        if(incomeAlreadyExists){
            const error = new Error('This income has already been budgeted.')
            error.code = 401
            throw error
        }
        const newIncome = {
            _id: uuid(),
            category: 'Income',
            subcategory: incomeInput.category,
            amount: parseInt(incomeInput.amount),
            details: incomeInput.details,
            frequency: incomeInput.frequency,
            lastPayout: incomeInput.lastPayout,
            nextPayout: dateRangeCalculator(incomeInput.frequency, incomeInput.lastPayout),
            autoWriting: incomeInput.autoWriting === 'yes' ? true : false,
            notification: incomeInput.notification === 'yes' ? true : false,
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
        const editedIncome = {
            _id: incomeInput._id,
            category: 'Income',
            subcategory: incomeInput.category,
            amount: parseInt(incomeInput.amount),
            details: incomeInput.details,
            frequency: incomeInput.frequency,
            lastPayout: incomeInput.lastPayout,
            nextPayout: dateRangeCalculator(incomeInput.frequency, incomeInput.lastPayout),
            autoWriting: incomeInput.autoWriting === 'yes' ? true : false,
            notification: incomeInput.notification === 'yes' ? true : false,
            color: incomeInput.color
        }
        user.incomes.find( (income, index) => {
            if(income._id === incomeInput._id){
                user.incomes[index] = editedIncome
            }
        })
        await user.save()
        return editedIncome

    },
    deleteIncome: async function ({incomeInputId}, req){
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
        user.incomes = user.incomes.filter(income => income._id !== incomeInputId)
        await user.save()
        return 'success'
    }
}