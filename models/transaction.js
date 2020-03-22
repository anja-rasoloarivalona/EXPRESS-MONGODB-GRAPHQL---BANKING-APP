const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    shortId: {
        type: String, 
        required: true
    },
    date: {
        type: String, 
        required: true
    },
    counterparty: {
        type: String, 
        required: true
    },
    amount: {
        type: Number, 
        required: true
    },
    details: {
        type: String, 
        required: true
    },
    usedWallet: {
        type: Schema.Types.ObjectId, 
        ref: 'Wallet'
    },
    status: {
        type: String, 
        required: true
    },
    transactionType: {
        type: String, 
        required: true
    },
    category: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {timestamps: true})

module.exports = mongoose.model('Transaction', transactionSchema)