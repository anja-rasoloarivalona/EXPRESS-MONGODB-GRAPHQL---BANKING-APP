import User from '../../models/user'
export default {
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
            { x: 0, y: 0, w: 4, h: 6, i: 'balance', displayed: true, ghostMode: 'hide' },
            {x: 8, y: 30, w: 4, h: 20, i: 'calendar', displayed: true, ghostMode: 'display' },
            { x: 0, y: 12, w: 8, h: 9, i: 'budget', displayed: true, ghostMode: 'hide' },
            { x: 8, y: 12, w: 4, h: 18, i: 'wallet', displayed: true, ghostMode: 'hide' },
            { x: 0, y: 34, w: 8, h: 16, i: 'transactions', displayed: true, ghostMode: 'hide' },
            { x: 4, y: 6, w: 4, h: 6, i: 'goal', displayed: true, ghostMode: 'display' },
            { x: 4, y: 0, w: 4, h: 6, i: 'monthly', displayed: true, ghostMode: 'hide' },
            { x: 0, y: 21, w: 8, h: 13, i: 'history', displayed: true, ghostMode: 'display' },
            { x: 0, y: 6, w: 4, h: 6, i: 'available', displayed: true, ghostMode: 'hide' },
            { x: 8, y: 0, w: 4, h: 12, i: 'expenses', displayed: true, ghostMode: 'display' }
        ]
        layout.find((item, index) => {
        if (item.i === 'budget') {
            let budgetHeight = 3
            user.expenses.forEach(expense => {
            if (expense.expenseType === 'variable') {
                budgetHeight = budgetHeight + 3
            }
            })
            layout[index].h = budgetHeight > 9 ? budgetHeight : 9
        }
        if (item.i === 'wallet') {
            layout[index].h = user.wallets.length > 1 ? 4 + (user.wallets.length * 7) : 18
        }
        if (item.i === 'transactions') {
            layout[index].h = 6 + (2 * 3)
        }
        })
        return layout
    }
}