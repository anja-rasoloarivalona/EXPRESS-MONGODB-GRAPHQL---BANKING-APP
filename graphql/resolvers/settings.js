import User from '../../models/user'

export default {
    updateDashboardLayout: async function ({input
            // balance,
            // budget,
            // expenses,
            // goal,
            // history,
            // monthly,
            // transactions,
            // wallet
        }, req) {
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
        const data = []
        for(let item in input){
            const i = input[item]
            if(i.displayed === 'true'){
                i.displayed = true
            } else {
                i.displayed = false
            }
            data.push(i)
        }
        user.settings.dashboardLayout = data
        await user.save()
        return data
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
    },
    setCurrency: async function({ currency }, req) {
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
        user.settings.currency = currency
        await user.save()
        return 'success'
    }
}