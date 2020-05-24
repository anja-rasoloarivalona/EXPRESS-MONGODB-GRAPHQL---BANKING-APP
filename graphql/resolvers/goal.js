const User = require('../../models/user');
module.exports = {
    addGoal: async function({goalInput}, req) {
        console.log('addning goal')
        if(!req.isAuth) {
            const error = new Error('Not authenticated.')
            error.code = 401;
            throw error
        }
        const user = await User.findById(req.userId)
        if(!user) {
            const error = new Error('User not found.')
            error.code = 401;
            throw error
        }
        if(user.status === 'setup'){
            const layout = this.setDefaultDashboardLayout(user)
            user.settings.dashboardLayout = layout
        }
        const goal = {
            amount: parseInt(goalInput.amount),
            date: goalInput.date
        }
        user.status = 'active'
        user.goal = goal
        await user.save()
        return goal
    },

    setDefaultDashboardLayout (user) {
        const layout = [
            { x: 0, y: 0, w: 4, h: 6, i: 'balance', displayed: true },
            { x: 0, y: 6, w: 8, h: 0, i: 'budget', displayed: true },
            { x: 8, y: 0, w: 4, h: 5, i: 'wallet', displayed: true },
            { x: 0, y: 12, w: 8, h: 6, i: 'transactions', displayed: true },
            { x: 4, y: 0, w: 4, h: 6, i: 'goal', displayed: true },
            { x: 4, y: 0, w: 4, h: 6, i: 'monthly', displayed: true },
            { x: 0, y: 12, w: 8, h: 12, i: 'history', displayed: true },
            { x: 0, y: 6, w: 4, h: 6, i: 'available', displayed: true },
            { x: 8, y: 0, w: 4, h: 12, i: 'expenses', displayed: true }
        ]
        layout.find((item, index) => {
        if (item.i === 'budget') {
            let budgetHeight = 3
            user.expenses.forEach(expense => {
            if (expense.expenseType === 'variable') {
                budgetHeight = budgetHeight + 3
            }
            })
            layout[index].h = budgetHeight
        }
        if (item.i === 'wallet') {
            layout[index].h = 4 + (user.wallets.length * 7)
        }
        if (item.i === 'transactions') {
            layout[index].h = 6 + (2 * 3)
        }
        })
        return layout
    }
}