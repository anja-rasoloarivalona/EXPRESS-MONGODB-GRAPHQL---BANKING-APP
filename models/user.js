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
  ],
  incomes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Income'
    }
  ],
  expenses: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Expense'
    }
  ]
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);
