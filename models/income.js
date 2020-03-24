const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const incomeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    used: Number,
    from: {
        type: String,
        required: true
    },
    frequency: {
        counter: {
            type: String,
            required: true
        },
        period: {
            type: String,
            required: true
        }
    },
    lastPayout: {
        type: String,
        required: true
    },
    nextPayout: {
        type: String, 
        required: true
    },
    autoWriting: {
        type: Boolean,
        required: true
    },
    notification: {
        type: Boolean,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    monthlyReport: [{
        period: String,
        amount: Number,
        transactions: [{
            type: Schema.Types.ObjectId,
            ref: 'Transaction'
        }],
    }]
}, {timestamps: true});

module.exports = mongoose.model('Income', incomeSchema)