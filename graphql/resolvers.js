const bcrypt = require('bcryptjs');
const validator = require('validator');

const User = require('../models/user');
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
            password: hashedPassword
        })
        const createdUser = await user.save()
        return {
            ...createdUser._doc, _id: createdUser._id.toString()
        }
    },

    user: async function({}, req) {
        const user = await User.findOne({ email: 'test@test.com'})
        if(!user){
            const error = new Error('No user found');
            error.statusCode = 404
            throw error
        }
        return user
    }
}