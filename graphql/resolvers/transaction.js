const User = require('../../models/user')
const dateRangeCalculator = require('../../utilities/DateRangeCalculator')
const { uuid } = require('uuidv4')

module.exports = {
    addTransaction: async function({transactionInput}, req) {
        console.log('addding')
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

        // DETERMINE THE TRANSACTION TYPE
        let isIncome = false
        let isExpense = false
        if (transactionInput.transactionType === 'expense'){
            isExpense = true
        } else {
            isIncome = true
        }

        // PREPARE AMOUNT DATA
        const amount = parseInt(transactionInput.amount)

        // CALCULATE THE NEW TRANSACTION RANK
        let rank = 0
        if(user.monthlyReports.length > 0){
            user.monthlyReports.forEach(report => {
                rank += report.transactions.length
            })
        }

        


        // CREATE THE TRANSACTION
        const newTransaction = {
            _id: uuid(),
            shortId: rank + 1,
            date: transactionInput.date,
            name: transactionInput.name,
            counterparty: transactionInput.counterparty,
            amount: isIncome ? amount : amount * -1,
            details: transactionInput.details,
            usedWalletId: transactionInput.usedWalletId,
            status: transactionInput.status,
            transactionType: transactionInput.transactionType,
            owner: req.userId
        }

        // ADD A CATEGORY FIELD FOR EXPENSES
        if (isExpense){
            newTransaction.category = transactionInput.category
        }

        // CREATE THE PERIOD
        const d = new Date(transactionInput.date)
        const period = `${d.getMonth() + 1}-${d.getFullYear()}`

        // CHECK IF WE ALREADY HAVE MONTHLY REPORTS
        if(user.monthlyReports.length < 1){
            // CREATE NEW ONE
            user.monthlyReports = [{
                period: period,
                income: isIncome ? amount : 0,
                expense: isExpense ? amount: 0,
                transactions: [newTransaction]
            }]
        } else {
           const didFindReport = user.monthlyReports.find( (report, index) => {
                if(report.period === period){
                    user.monthlyReports[index].transactions.push(newTransaction)
                    if(isIncome){
                        user.monthlyReports[index].income += amount
                    } else {
                        user.monthlyReports[index].expense += amount
                    }
                    return true
                }
            })
            if(!didFindReport){
                user.monthlyReports.push({
                    period: period,
                    income: isIncome ? amount : 0,
                    expense: isExpense ? amount: 0,
                    transactions: [newTransaction]
                })
            }
        }

        // UPDATE THE USED WALLET
        user.wallets.find( (wallet, index) => {
            if(wallet._id === transactionInput.usedWalletId){
                if(isIncome){
                    user.wallets[index].amount += amount
                }
                if(isExpense){
                    user.wallets[index].amount -= amount 
                }
                return true
            }
        })

        // UPDATE INCOME DATE IF INCOME
        if(isIncome){
            user.incomes.find( (income, index) => {
                if(income.name === transactionInput.name){
                    user.incomes[index].lastPayout = transactionInput.date
                    user.incomes[index].nextPayout = dateRangeCalculator(income.frequency, transactionInput.date).toLocaleDateString() 
                    return true
                }
            })
        }

        // UPDATE EXPENSE DATA IF EXPENSE
        if(isExpense){
            let isFixed = false
            let isVariable = false
            user.expenses.find( (expense, index) => {
                if(expense.name === transactionInput.name){
                    if(user.expenses[index].expenseType === 'variable'){
                        isVariable = true
                    } else {
                        isFixed = true
                    }

                    if(isFixed){
                        user.expenses[index].lastPayout = transactionInput.date
                        user.expenses[index].nextPayout = dateRangeCalculator(expense.frequency, transactionInput.date).toLocaleDateString()
                    }
                    if(isVariable){
                        if(user.expenses[index].currentPeriod === period){
                            user.expenses[index].used += amount
                        }        
                    }
                }
            })
        }

       const userResData = await user.save()
        return userResData
    }
}