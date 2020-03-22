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
  goal : {
    name: String,
    amount: Number,
    date: String
  },
  status: String,
  transactions: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Transaction'
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
