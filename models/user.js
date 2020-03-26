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
  monthlyReports: [{
      period: String,
      income: Number,
      expense: Number,
      transactions: [
        {
          _id: {
            type: String,
            required: true,
          },
          shortId: {
            type: String, 
            required: true
          },
          date: {
              type: String, 
              required: true
          },
          name: {
              type: String, 
              required: true
          },
          counterparty: String,
          amount: {
              type: Number, 
              required: true
          },
          details: {
              type: String, 
              required: true
          },
          usedWalletId: {
             type: String, 
             required: true
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
        }
      ]
  }],
  wallets: [
    {
      _id: {
        type: String,
        required: true
      },
      walletType: String,
      supplier: String,
      amount: Number,
      shortId: String,
      color: String
    }
  ],
  incomes: [
    {
      _id: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      amount: {
          type: Number,
          required: true
      },
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
    }
  ],
  expenses: [
    {
      _id: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      amount: {
          type: Number,
          required: true
      },
      currentPeriod: String,
      used: Number,
      category: {
          type: String,
          required: true
      },
      expenseType: {
          type: String,
          required: true
      },
      frequency: {
          counter: String,
          period: String
      },
      lastPayout: String,
      nextPayout: String
    }
  ]
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);
