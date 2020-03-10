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
  transactions: [
    {
      counterparty: String,
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
      amount: Number,
      shortId: String
    }
  ]
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);
