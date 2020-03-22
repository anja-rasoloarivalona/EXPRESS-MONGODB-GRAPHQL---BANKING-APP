const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const walletSchema = new Schema({
    walletType: String,
    supplier: String,
    amount: Number,
    shortId: String,
    color: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    transactions: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Transaction'
        }
    ]
}, {timestamps: true})


module.exports = mongoose.model('Wallet', walletSchema)