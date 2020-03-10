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
  status: {
    type: String,
    default: 'I am new!'
  },
  transactions: [
    {
      counterParty: String,
      details: String,
      usedWallet: String,
      amount: Number,
      status: String
    }
  ],
  wallets: [
    {
      type: String,
      supplier: String,
      amount: Number
    }
  ]
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);
