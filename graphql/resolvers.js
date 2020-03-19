const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken')

const User = require('../models/user');
const Wallet = require('../models/wallet');
const Income = require('../models/income');
const Expense = require('../models/expense')

const dateRangeCalculator = require('../utilities/DateRangeCalculator');

module.exports = {
    createUser: async function({ userInput }, req) {
        // createUser: async function(args, req) {
        //email => args.userInput.email
        const errors = []
        if(!validator.isEmail(userInput.email)){
            errors.push('Email is not valid')
        }
        if(validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, {min: 5})){
            errors.push('Password too short')
        }

        if(errors.length > 0){
            const error = new Error('invalid input')
            error.data = errors;
            error.code = 422;
            throw error
        }
        const existingUser = await User.findOne({ email: userInput.email});
        if(existingUser) {
            const error = new Error('User exists already!');
            throw error
        };
        const hashedPassword = await bcrypt.hash(userInput.password, 12);
        const user = new User ({
            email: userInput.email,
            name: userInput.name,
            password: hashedPassword,
            status: 'created'
        })
        const createdUser = await user.save()
        const token = jwt.sign({
            userId: user._id.toString(),
            email: user.email
        }, 'infiowenfew123', { expiresIn: '24h'})

        return {
            token: token,
            user: {
                ...createdUser._doc, 
                _id: createdUser._id.toString()
            }
        }
    },
    login: async function({ email, password}) {
        const user = await User.findOne({ email: email}).populate('wallets incomes').exec()
        if(!user) {
            const error = new Error('User not found.');
            error.code = 401;
            throw error
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if(!isEqual){
            const error = new Error('Password is invalid');
            error.code = 401;
            throw error
        }
        const token = jwt.sign({
            userId: user._id.toString(),
            email: user.email
        }, 'infiowenfew123', { expiresIn: '24h'})
        return {
            token: token,
            user: {
                ...user._doc, 
                _id: user._id.toString()
            },
       
        }
    },
    user: async function(args, req) {
        if(!req.isAuth) {
            const error = new Error('Not authenticated.')
            error.code = 401;
            throw error
        }
        const user = await User.findById(req.userId).populate('wallets incomes').exec()
        if(!user){
            const error = new Error('No user found');
            error.statusCode = 404
            throw error
        }
        return user
    },
    addWallet: async function({ walletInput}, req) {
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
        const newWallet = new Wallet ({
            walletType: walletInput.walletType,
            supplier: walletInput.supplier,
            amount: parseInt(walletInput.amount),
            shortId: walletInput.shortId,
            color: walletInput.color,
            owner: req.userId
        })
        await newWallet.save()
        user.wallets.push(newWallet) 
        await user.save()
        return newWallet

    },
    editWallet: async function ({walletId, walletInput}, req) {
        if(!req.isAuth) {
            const error = new Error('Not authenticated.')
            error.code = 401;
            throw error
        }
        const updatedWallet = await Wallet.findById(walletId)
        if(!updatedWallet) {
            const error = new Error('No card found.')
            error.code = 404;
            throw error
        }
        if(updatedWallet.owner.toString() !== req.userId.toString()){
            const error = new Error('Not authorized.')
            error.code = 403;
            throw error
        }
        updatedWallet.walletType = walletInput.walletType
        updatedWallet.supplier = walletInput.supplier
        updatedWallet.amount = parseInt(walletInput.amount)
        updatedWallet.shortId = walletInput.shortId
        updatedWallet.color = walletInput.color
        await updatedWallet.save()
        return updatedWallet
    },
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

        console.log('inpyt', incomeInput)

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

        const newExpense = new Expense ({
            name: expenseInput.name,
            amount: parseInt(expenseInput.amount),
            category: expenseInput.category,
            expenseType: expenseInput.expenseType,
            used: 0,
            owner: req.userId
        })

        await newExpense.save()
        user.expenses.push(newExpense)
        await user.save()
        return newExpense
    }
    

    

}