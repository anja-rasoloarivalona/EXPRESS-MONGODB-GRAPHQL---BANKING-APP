const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  status: String,
  budgets: [
    {
      name: String,
      amount: Number,
      used: Number
    }
  ],
  transactions: [
    {
      counterparty: String,
      details: String,
      Date: String,
      usedWallet: String,
      amount: Number,
      status: String
    }
  ],
  wallets: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Wallet'
    }
  ]
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);
