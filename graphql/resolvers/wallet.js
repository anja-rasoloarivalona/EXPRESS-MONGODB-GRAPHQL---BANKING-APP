const User = require('../../models/user');
const { uuid } = require('uuidv4')

module.exports = {
    addWallet: async function({ walletInput}, req) {
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
        const newWallet = {
            _id: uuid(),
            walletType: walletInput.walletType,
            supplier: walletInput.supplier,
            amount: parseInt(walletInput.amount),
            shortId: walletInput.shortId,
            color: walletInput.color,
            owner: req.userId
        }
        user.wallets.push(newWallet) 
        await user.save()
        return newWallet

    },
    editWallet: async function ({walletInput}, req) {
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
        let updatedWalletIndex
        user.wallets.find( (wallet, index) => {
            if(wallet._id === walletInput._id){
                updatedWalletIndex = index
                user.wallets[index] = {
                    _id: wallet._id,
                    walletType: walletInput.walletType,
                    supplier: walletInput.supplier,
                    amount: parseInt(walletInput.amount),
                    shortId: walletInput.shortId,
                    color: walletInput.color
                }
                return true
            }
        })
        await user.save()
        return user.wallets[updatedWalletIndex]
    },
}