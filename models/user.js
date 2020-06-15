import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    current: {
      type: String,
      required: true
    },
    old: [String],
    resetCode: {
      code: Number,
      expiryTime: String,
      token: String
    }
  },
  verificationCode: {
    type: Number,
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
  activeDate: String,
  monthlyReports: [{
      period: String,
      income: Number,
      expense: Number,
      details: [{
        _id: String,
        amount: Number,
        used: Number,
      }],
      transactions: [
        {
          _id: {
            type: String,
            required: true,
          },
          budgetId: {
            type: String, 
            required: true
          },
          date: {
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
          }
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
      name: String,
      amount: Number,
      creditLimit: Number,
      color: String
    }
  ],
  incomes: [
    {
      _id: {
        type: String,
        required: true
      },
      category: {
        type: String,
        required: true
      },
      amount: {
          type: Number,
          required: true
      },
      details: {
          type: String,
          required: false
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
      color: String
    }
  ],
  expenses: [
    {
      _id: {
        type: String,
        required: true
      },
      category: {
        type: String,
        required: true
      },
      subcategory: {
        type: String,
        required: true
      },
      amount: {
          type: Number,
          required: true
      },
      currentPeriod: String,
      used: Number,
      expenseType: {
          type: String,
          required: true
      },
      frequency: {
          counter: String,
          period: String
      },
      lastPayout: String,
      nextPayout: String,
      color: String
    }
  ],
  settings: {
    dashboardLayout: Array,
    theme: String,
    currency: String
  }
}, {timestamps: true});

export default mongoose.model('User', userSchema);
