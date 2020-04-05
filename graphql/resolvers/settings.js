const User = require('../../models/user');

module.exports = {
    updateDashboardLayout: async function ({layoutInput}, req) {
        console.log('new layout', layoutInput)
        return layoutInput.layout
    },
    setTheme: async function ({theme}, req) {
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
        user.settings.theme = theme
        await user.save()
        return user
    }
}