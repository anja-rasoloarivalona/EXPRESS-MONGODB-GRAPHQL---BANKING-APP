import User from '../../models/user.js'
export default {
    addGoal: async function({goalInput}, req) {
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
        const goal = {
            amount: parseInt(goalInput.amount),
            date: goalInput.date
        }
        user.goal = goal
        await user.save()
        return goal
    }
}