import User from '../../models/user.js'
import { dateRangeCalculator } from '../../utilities/DateRangeCalculator.js'
import { uuid } from 'uuidv4'

export default {
    editTransaction: async function({transactionInput}, req) {
        let data = {
            transactionInput: {...transactionInput, isEditing: true}
        }
        const res = await this.deleteTransaction(data, req)
        return res
    },
    addTransaction: async function({transactionInput}, req) {
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

        // *****************  DETERMINE TRANSACTION TYPE *********************** //
        let isIncome = false
        let isIncomeBudgeted =  false
        let isExpense = false
        let isExpenseBudgeted = false
        let isExpenseVariable = false
        let isExpenseFixed = false
        let expenseAmount
        const transactionIsPending = new Date(transactionInput.date) > new Date()

        if(transactionInput.transactionType === 'expense'){
            isExpense = true
            user.expenses.find(expense => {
                if(expense.category === transactionInput.category && expense.subcategory === transactionInput.subcategory){
                    isExpenseBudgeted = true
                    if(expense.expenseType === 'Fixed'){
                        isExpenseFixed = true
                    } else {
                        isExpenseVariable = true
                        expenseAmount = expense.amount
                    }
                    return true
                }
            })
        } else {
            isIncome = true
            user.incomes.find(income => {
                if(income.category === transactionInput.category){
                    isIncomeBudgeted = true
                }
            })
        }


        // ************************ DETERMINE PERIOD ***************************** //
        const d = new Date(transactionInput.date)
        const period = `${d.getMonth() + 1}-${d.getFullYear()}`


        // **** ********************PREPARE AMOUNT DATA *****************************//
        const amount = parseInt(transactionInput.amount) // INTEGER
        let transactionAmount = amount;
        if(isExpense && amount > 0) {
            transactionAmount = amount * -1 // IF WE NEED THE EXPENSE TO BE NEGATIVE
        } 

        // ***************** STEP 1 : CREATE THE TRANSACTION ***********************//
        const newTransaction = {
            _id: transactionInput.deletedTransaction_shortId ? transactionInput.deletedTransaction_id : uuid(),
            category: transactionInput.category,
            subcategory:  transactionInput.subcategory,
            date: transactionInput.date,
            counterparty: transactionInput.counterparty,
            amount: transactionAmount,
            details: transactionInput.details,
            usedWalletId: transactionInput.usedWalletId,
            transactionType: transactionInput.transactionType,
            status: transactionIsPending ? 'pending' : 'paid'
        }

        // *************** STEP 2 : UPDATE MONTHLY REPORTS ***************************//
        const newMonthlyReportDetail = { 
            category: newTransaction.category,
            subcategory: newTransaction.subcategory
        }
        if(isExpense && isExpenseVariable){
            newMonthlyReportDetail.amount = expenseAmount
            newMonthlyReportDetail.used = amount
            newMonthlyReportDetail.amountInitialization = 0
        } else {
            newMonthlyReportDetail.amount = amount
        }
        // STEP 2.1  CHECK IF WE ALREADY HAVE MONTHLY REPORT
        if(user.monthlyReports.length < 1){
                 //// ***** CASE 1 : NO REPORT IN THE USER DATA ***** //
                        // Create the monthly report and insert the new budget built at step 1
                        user.monthlyReports = [{
                            period: period,
                            income: isIncome ? amount : 0,
                            expense: isExpense ? amount: 0,
                            details: [newMonthlyReportDetail],
                            transactions: [newTransaction]
                        }]
        } else { 
               ////  ***** CASE 2 : THE USER ALREADY HAVE REPORTS ***** //
           const didFindReport = user.monthlyReports.find( (report, index) => {
                if(report.period === period){
                    // ***** CASE 2.1 : A REPORT MATCHING THE PERIOD HAS BEEN FOUND ***** //   
                    user.monthlyReports[index].transactions.push(newTransaction)
                    if(isIncome){
                        user.monthlyReports[index].income += amount
                    } else {
                        user.monthlyReports[index].expense += amount
                    }
                    // **** CASE 2.1.a : CHECK IF THE NEW TRANSACTION IS ALREADY STORED IN THAT REPORT
                    const didFindCurrentTransactionDetailInReport =  user.monthlyReports[index].details.find( (detail, dIndex) => {
                        if(detail.category === newTransaction.category && detail.subcategory === newTransaction.subcategory){
                            // ALREADY STORED
                            if(isExpense && isExpenseVariable){
                                user.monthlyReports[index].details[dIndex].used += amount
                            } else {
                                user.monthlyReports[index].details[dIndex].amount += amount
                            }
                            return true
                        }
                    })
                    if(!didFindCurrentTransactionDetailInReport){
                            // NOT STORED YET
                        user.monthlyReports[index].details.push(newMonthlyReportDetail)
                    }
                    return true
                }
            })
            if(!didFindReport){
                // ***** CASE 3 : NO REPORT MATCH THE PERIOD  ***** //
                user.monthlyReports.push({
                    period: period,
                    income: isIncome ? amount : 0,
                    expense: isExpense ? amount: 0,
                    details: [newMonthlyReportDetail],
                    transactions: [newTransaction]
                })
            }
        }


        // UPDATE WALLET IF THE TRANSACTION IS NOT PENDING
        if(!transactionIsPending){
            user.wallets.find( (wallet, index) => {
                if(wallet._id === transactionInput.usedWalletId){
                    if(user.wallets[index].walletType === 'Credit card'){
                        user.wallets[index].amount -= transactionAmount
                    } else {
                            user.wallets[index].amount += transactionAmount
                    }
                    return true
                }
            })
        }
        // UPDATE CREDIT CARD IF THE TRANSACTION IS A PAYMENT MADE FOR THAT CREDIT CARD
        // if(creditCards.includes(transactionInput.name.split(' ')[0])){
        //     user.wallets.find( (wallet, index) => {
        //         if(wallet.walletType === transactionInput.name.split(' ')[0] && wallet.supplier === transactionInput.name.split(' ')[1]){
        //             user.wallets[index].amount -= amount
        //             return true
        //         }
        //     })
        // }
        // UPDATE INCOME DATE IF INCOME
        if(isIncome && isIncomeBudgeted){
            user.incomes.find( (income, index) => {
                if(income.category === newTransaction.category && income.subcategory === newTransaction.subcategory){
                    user.incomes[index].lastPayout = transactionInput.date
                    user.incomes[index].nextPayout = dateRangeCalculator(income.frequency, transactionInput.date).toLocaleDateString() 
                    return true
                }
            })
        }

        // UPDATE EXPENSE DATA IF EXPENSE
        if(isExpense && isExpenseBudgeted){
            user.expenses.find( (expense, index) => {
                if(expense.category === newTransaction.category && expense.subcategory === newTransaction.subcategory){
                    if(isExpenseFixed){
                        user.expenses[index].lastPayout = transactionInput.date
                        user.expenses[index].nextPayout = dateRangeCalculator(expense.frequency, transactionInput.date).toLocaleDateString()
                    }
                    if(isExpenseVariable && user.expenses[index].currentPeriod === period){
                        user.expenses[index].used += amount  
                    }
                }
            })
        }

       const userResData = await user.save()
        return userResData
    },

    deleteTransaction: async function({ transactionInput}, req) {
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

        let isEditing = false
        if(transactionInput.isEditing){
            isEditing = true
        }
    
        let deletedTransaction, iReport, iTransaction;

        let isIncome = false
        let isIncomeBudgeted = false
        let incomeIndex = null

        let isExpense = false
        let isExpenseBudgeted = false
        let expenseIndex = null

        let isExpenseFixed = false
        let isExpenseVariable = false

        // PREPARE DATA
        user.monthlyReports.forEach((report, indexReport) => {
            report.transactions.find((transaction, indexTransaction) => {
                if(transaction._id === transactionInput._id){
                   deletedTransaction = user.monthlyReports[indexReport].transactions[indexTransaction]
                   if(deletedTransaction.transactionType === 'income'){
                       isIncome = true
                       user.incomes.find((income, i) => {
                           if(income.subcategory === deletedTransaction.subcategory){
                               isIncomeBudgeted = true
                               incomeIndex = i
                           }
                           return true
                       })
                   } else {
                       isExpense = true
                       user.expenses.find((expense, i) => {
                           if(expense.category === deletedTransaction.category && expense.subcategory === deletedTransaction.subcategory){
                               isExpenseBudgeted = true
                               expenseIndex = i
                               if(expense.expenseType === 'Fixed'){
                                   isExpenseFixed = true
                               } else {
                                   isExpenseVariable = true
                               }
                               return true
                           }
                       })
                   }
                   iReport = indexReport
                   iTransaction = indexTransaction 
                   return true
                }
            })
        })
    
        const dp = new Date(deletedTransaction.date)
        const deletedTransactionPeriod = `${dp.getMonth() + 1}-${dp.getFullYear()}`

        // CANCEL TRANSACTION
        if(isIncome){
            // ROLLS BACK INCOME IF NEEDED
            if(isIncomeBudgeted){
                user.incomes[incomeIndex].nextPayout = user.incomes[incomeIndex].lastPayout
                user.incomes[incomeIndex].lastPayout = dateRangeCalculator(user.incomes[incomeIndex].frequency, user.incomes[incomeIndex].lastPayout, true)
            }
            // CANCEL THE AMOUNT IN WALLET
            user.wallets.find((wallet, index) => {
                if(wallet._id === deletedTransaction.usedWalletId){
                    user.wallets[index].amount -= deletedTransaction.amount
                }
            })
            // CANCEL TRANSACTION IN MONTHLY REPORTS
            user.monthlyReports[iReport].income -= deletedTransaction.amount
            user.monthlyReports[iReport].details.find((detail, iDetail) => {
                if(detail.subcategory === deletedTransaction.subcategory){
                    user.monthlyReports[iReport].details[iDetail].amount -= deletedTransaction.amount
                }
            })

        }
        if(isExpense){
            // ROLLS BACK EXPENSE IF NEEDED
            if(isExpenseBudgeted){
                if(isExpenseVariable && user.expenses[expenseIndex].currentPeriod === deletedTransactionPeriod){
                    user.expenses[expenseIndex].used += deletedTransaction.amount
                }
                if(isExpenseFixed){
                    user.expenses[expenseIndex].nextPayout = user.expenses[expenseIndex].lastPayout
                    user.expenses[expenseIndex].lastPayout = dateRangeCalculator(user.expenses[expenseIndex].frequency, user.expenses[expenseIndex].lastPayout, true)
                }
            }
            // CANCEL THE AMOUNT IN WALLET
            let usedWalletIndex, usedWalletType
            user.wallets.find( (wallet, index) => {
                if(wallet._id === deletedTransaction.usedWalletId){
                    usedWalletIndex = index
                    usedWalletType = wallet.walletType
                    return true
                }
            })
            if(usedWalletType === 'Credit card'){
                user.wallets[usedWalletIndex].amount += deletedTransaction.amount
            } else {
                user.wallets[usedWalletIndex].amount -= deletedTransaction.amount
            }

            // CHECK IF THE TRANSACTION IS A PAYMENT TO A CREDIT CARD
            // user.wallets.find((wallet, index) => {
            //     if(wallet._id === deletedTransaction.budgetId){
            //         user.wallets[index].amount -= deletedTransaction.amount
            //     }
            // })

            // if(creditCards.includes(deletedTransaction.name.split(' ')[0])){
            // user.wallets.find( (wallet, index) => {
            //     if(wallet.walletType === deletedTransaction.name.split(' ')[0] && wallet.supplier === deletedTransaction.name.split(' ')[1]){
            //         user.wallets[index].amount -= deletedTransaction.amount
            //         return true
            //     }
            //     })
            // }

            // CANCEL TRANSACTION IN MONTHLY REPORTS
            user.monthlyReports[iReport].expense += deletedTransaction.amount
            user.monthlyReports[iReport].details.find((detail, iDetail) => {
                if(detail.category === deletedTransaction.category && detail.subcategory === deletedTransaction.subcategory){
                    if(user.monthlyReports[iReport].details[iDetail].used){
                        user.monthlyReports[iReport].details[iDetail].used += deletedTransaction.amount
                    } else {
                        user.monthlyReports[iReport].details[iDetail].amount += deletedTransaction.amount
                    }
                }
            })
        }


        // DELETE TRANSACTION FROM THE REPORT
        user.monthlyReports[iReport].transactions = user.monthlyReports[iReport].transactions.filter(transaction => transaction._id !== deletedTransaction._id)
        const res = await user.save()


        // CHECK IF WE ARE EDITING
        if(isEditing){
            const data = {
                transactionInput : {
                    ...transactionInput,
                    amount: transactionInput.amount,
                    deletedTransaction_id: deletedTransaction._id
                }
            }
           const res = await this.addTransaction(data, req)
           return res
        } else {
            return res
        }
    }
}