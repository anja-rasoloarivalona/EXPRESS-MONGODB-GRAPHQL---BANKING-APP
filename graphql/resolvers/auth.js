const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken')
const User = require('../../models/user');

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
            console.log('throwing error')
            throw error
        }
        const existingUser = await User.findOne({ email: userInput.email});
        if(existingUser) {
            const error = new Error('User exists already!');
            console.log('throwing error')
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
    user: async function(args, req) {
        if(!req.isAuth) {
            const error = new Error('Not authenticated.')
            error.code = 401;
            throw error
        }
        const user = await User.findById(req.userId)
        if(!user){
            const error = new Error('No user found');
            error.statusCode = 404
            throw error
        }
        return user
    }  
}