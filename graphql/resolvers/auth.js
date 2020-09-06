import bcrypt from 'bcryptjs'
import validator from 'validator'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import sendGridTransport from 'nodemailer-sendgrid-transport'
import { uuid } from 'uuidv4'
import User from '../../models/user.js'

const transporter = nodemailer.createTransport(sendGridTransport({
    auth: {
        api_key: process.env.NODEMAILER_API_KEY
    }
}));

 export default {
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
        const verificationCode = Math.floor(100000 + Math.random() * 900000)
        const user = new User ({
            email: userInput.email,
            name: userInput.name,
            password: {
                current: hashedPassword
            },
            status: 'setup-verify-code',
            settings: {
                theme: 'light-green'
            },
            verificationCode: verificationCode
        })

        // const createdUser = await user.save()
        // const token = jwt.sign({
        //         userId: user._id.toString(),
        //         email: user.email
        // }, 'infiowenfew123', { expiresIn: '24h'})
    
            // return {
            //     token: token,
            //     user: {
            //         ...createdUser._doc, 
            //         _id: createdUser._id.toString()
            //     }
            // }

        const isEmailSent = await transporter.sendMail({
            to: userInput.email,
            from: 'rasoloanja@gmail.com',
            subject: 'Here is your validation code',
            html: `<div>
                      <div>Hello ${userInput.name},</div>
                      <br>
                      <div>Please ensure that the following validation code is entered within the next 30 minutes:</div>
                      <br>
                      <div><b>${verificationCode}</b></div>
                      <br>
                      <div>Thank you!</div>
                   <div>`
        })

        if(isEmailSent){
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
        } else {
            const error = new Error('Email not sent');
            error.code = 401;
            throw error
        }
    },
    login: async function({ email, password}) {
        const user = await User.findOne({ email: email})
        if(!user) {
            const error = new Error('User not found.');
            error.code = 401;
            throw error
        }
        const isEqual = await bcrypt.compare(password, user.password.current);
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
            error.code = 404
            throw error
        }
        return user
    }  ,
    verifyUserCode: async function({code}, req) {
        if(!req.isAuth) {
            const error = new Error('Not authenticated.')
            error.code = 401;
            throw error
        }
        const user = await User.findById(req.userId)
        if(!user){
            const error = new Error('No user found');
            error.code = 404
            throw error
        }
        if(parseInt(code) === user.verificationCode){
            user.status = 'setup'
            await user.save()
            return 'succeeded'
        } else {
            const error = new Error('The code is incorrect. Please enter another one')
            error.code = 401
            throw error
        }
    },
    sendCodeToResetPassword: async function({email}, req){
        const existingUser = await User.findOne({ email: email});
        if(!existingUser) {
            const error = new Error('No user found');
            error.code = 404
            throw error
        };
        const resetCode = Math.floor(100000 + Math.random() * 900000)
        const expiryTime = new Date(new Date().getTime() + 10 * 60000) 

        existingUser.password.resetCode = {
            code: resetCode,
            expiryTime: expiryTime
        }

        const isEmailSent = await transporter.sendMail({
            to: email,
            from: 'rasoloanja@gmail.com',
            subject: 'Here is your validation code',
            html: `<div>
                      <div>Hello ${existingUser.name},</div>
                      <br>
                      <div>Please ensure that the following validation code is entered within the next 30 minutes:</div>
                      <br>
                      <div><b>${resetCode}</b></div>
                      <br>
                      <div>Thank you!</div>
                   <div>`
        })

        if(isEmailSent){
            await existingUser.save()
            return 'Code sent'
        }
    },

    verifyResetPasswordCode: async function({email, code}, req){
        const existingUser = await User.findOne({ email: email})
        if(!existingUser) {
            const error = new Error('No user found');
            error.code = 404
            throw error
        };
        if(new Date() > new Date(existingUser.password.resetCode.expiryTime)){
            const error = new Error('Your code has already expired, please ask for a new one')
            throw error
        }
        if(parseInt(code) !== existingUser.password.resetCode.code){
            const error = new Error('Code is incorrect. Please try again');
            error.code = 401;
            throw error
        }
        const token = uuid()
        existingUser.password.resetCode.token = token
        await existingUser.save()
        return token
    },
    resetPassword: async function({email, password, token}, req){
        const errors = []
        if(validator.isEmpty(password) || !validator.isLength(password, {min: 5})){
            errors.push('Password too short')
        }

        if(errors.length > 0){
            const error = new Error('Password is not valid')
            error.data = errors;
            error.code = 422;
            throw error
        }
        const user = await User.findOne({email: email})
        if(!User) {
            const error = new Error('No user found');
            error.code = 404
            throw error
        };

        if(user.password.resetCode.token !== token){
            const error = new Error('Action not authorized')
            error.code = 404
            throw error
        }

        if(user.password.old.length > 0){
            for(const oldPassword of user.password.old){
                const isEqual = await bcrypt.compare(password, oldPassword);
                if(isEqual){
                    const error = new Error('This is an old password. Please enter a new one')
                    error.code = 404
                    throw error
                }
            }
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        user.password.old.push(user.password.current)
        user.password.current = hashedPassword 
        user.password.resetCode = {}
        await user.save()
        return 'Your password has been updated. Please login'

    },
    finishSetup: async function({}, req) {
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
        const layout = this.setDefaultDashboardLayout(user)
        user.settings.dashboardLayout = layout
        user.status = 'active'
        user.activeDate = new Date().toString()
        await user.save()
        return user
    },
    setDefaultDashboardLayout (user) {
        const layout = [
            { x: 0, y: 6, w: 4, h: 6, i: 'available', minH: 6, minW: 3, displayed: true, ghostMode: 'hide' },
            { x: 0, y: 0, w: 4, h: 6, i: 'balance', minH: 6, minW: 3, displayed: true, ghostMode: 'hide' },
            { x: 0, y: 12, w: 8, h: 9, i: 'budget', minH: 9, minW: 8, displayed: true, ghostMode: 'hide' },
            { x: 8, y: 30, w: 4, h: 20, i: 'calendar', minH: 20, minW: 4, displayed: true, ghostMode: 'display' },
            { x: 8, y: 0, w: 4, h: 12, i: 'expenses', minH: 12, minW: 4, displayed: true, ghostMode: 'display' },
            { x: 4, y: 6, w: 4, h: 6, i: 'goal', minH: 6, minW: 4, displayed: true, ghostMode: 'display' },
            { x: 0, y: 21, w: 8, h: 13, i: 'history', minH: 13, minW: 8, displayed: true, ghostMode: 'display' },
            { x: 4, y: 0, w: 4, h: 6, i: 'monthly', minH: 6, minW: 3, displayed: true, ghostMode: 'hide' },
            { x: 0, y: 34, w: 8, h: 16, i: 'transactions', minW: 8, minH: 16, displayed: true, ghostMode: 'hide' },
            { x: 8, y: 12, w: 4, h: 18, i: 'wallet', minH: 18, minW: 4, displayed: true, ghostMode: 'hide' }
        ]
        layout.find((item, index) => {
        if (item.i === 'budget') {
            let budgetHeight = 3
            user.expenses.forEach(expense => {
            if (expense.expenseType === 'variable') {
                budgetHeight = budgetHeight + 3
            }
            })
            layout[index].h = budgetHeight > 9 ? budgetHeight : 9
        }
        if (item.i === 'wallet') {
            layout[index].h = user.wallets.length > 1 ? 4 + (user.wallets.length * 7) : 18
        }
        })
        return layout
    }
}