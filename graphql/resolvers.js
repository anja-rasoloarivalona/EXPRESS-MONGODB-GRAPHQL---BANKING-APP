const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken')

const User = require('../models/user');
const Wallet = require('../models/wallet')
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

    createNewCard: async function({ cardInput}, req) {
        const user = await User.findById(cardInput.userId)
        if(!user) {
            const error = new Error('User not found.')
            error.code = 401;
            throw error
        }

        const createdCard = new Wallet ({
            cardType: cardInput.cardType,
            supplier: cardInput.supplier,
            amount: parseInt(cardInput.amount),
            shortId: cardInput.shortId,
            color: cardInput.color,
            owner: cardInput.userId
        })
        await createdCard.save()
        user.wallets.push(createdCard) 
        await user.save()
        return createdCard

    },
    updatedOwnedCard: async function ({cardInput, cardId}, req) {
        const user = await User.findById(cardInput.userId)
        if(!user) {
            const error = new Error('User not found.')
            error.code = 401;
            throw error
        }
        const updatedCard = await Wallets.findById(cardId)
        updatedCard.cardType = cardInput.cardType
        updatedCard.supplier = cardInput.supplier
        updatedCard.amount = parseInt(cardInput.amount)
        updatedCard.shortId = cardInput.shortId
        updatedCard.color = cardInput.color
    },
    login: async function({ email, password}) {
        const user = await User.findOne({ email: email})
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

    user: async function({userId}, req) {
        const user = await User.findById(userId).populate('wallets').exec()
        if(!user){
            const error = new Error('No user found');
            error.statusCode = 404
            throw error
        }
        return user
    },

}