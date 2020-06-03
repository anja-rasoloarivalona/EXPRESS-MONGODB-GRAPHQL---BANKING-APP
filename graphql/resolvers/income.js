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

        // const currentPeriod = `${new Date().getMonth + 1}-${new Date().getFullYear()}`
        const newIncomeId = uuid()
        const newIncomeAmount = parseInt(incomeInput.amount)
        const newIncomeNextPayout = dateRangeCalculator(incomeInput.frequency, incomeInput.lastPayout)
        const newIncomeLastPayoutPeriod = `${new Date(incomeInput.lastPayout).getMonth() + 1}-${new Date(incomeInput.lastPayout).getFullYear()}`

        const newIncome = {
            _id: newIncomeId,
            name: incomeInput.name,
            amount: newIncomeAmount,
            from: incomeInput.from,
            frequency: incomeInput.frequency,
            lastPayout: incomeInput.lastPayout,
            nextPayout: newIncomeNextPayout,
            autoWriting: incomeInput.autoWriting === 'yes' ? true : false,
            notification: incomeInput.notification === 'yes' ? true : false,
            color: incomeInput.color
        }

        const newTransaction = {
            _id: uuid(),
            budgetId: newIncomeId,
            date: incomeInput.lastPayout,
            counterparty: '-',
            amount: newIncomeAmount,
            details: 'Initialization',
            usedWalletId: 'Unknown',
            status: 'paid',
            transactionType: 'income'
        }

        if(user.monthlyReports.length < 1){
            user.monthlyReports = [{
                period: newIncomeLastPayoutPeriod ,
                income: newIncomeAmount,
                expense: 0,
                details: [{
                    _id: newIncomeId,
                    amount: newIncomeAmount
                }],
                transactions: [newTransaction]
            }]
        } else {
            const didFindReport = user.monthlyReports.find((report, index) => {
                if(report.period === newIncomeLastPayoutPeriod){
                    user.monthlyReports[index].income += newIncomeAmount
                    user.monthlyReports[index].details.push({
                        _id: newIncomeId,
                        amount: newIncomeAmount
                    })
                    user.monthlyReports[index].transactions.push(newTransaction)
                    return true
                }
            })
            if(!didFindReport){
                user.monthlyReports.push({
                    period: newIncomeLastPayoutPeriod,
                    income: newIncomeAmount,
                    expense: 0,
                    details: [{
                        _id: newIncomeId,
                        amount: newIncomeAmount
                    }],
                    transactions: [newTransaction]
                })
            }
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