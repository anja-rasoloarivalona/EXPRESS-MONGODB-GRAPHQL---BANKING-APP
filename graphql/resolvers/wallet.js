const Wallet = require('../../models/wallet');
const User = require('../../models/user');

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
        const newWallet = new Wallet ({
            walletType: walletInput.walletType,
            supplier: walletInput.supplier,
            amount: parseInt(walletInput.amount),
            shortId: walletInput.shortId,
            color: walletInput.color,
            owner: req.userId
        })
        await newWallet.save()
        user.wallets.push(newWallet) 
        await user.save()
        return newWallet

    },
    editWallet: async function ({walletId, walletInput}, req) {
        if(!req.isAuth) {
            const error = new Error('Not authenticated.')
            error.code = 401;
            throw error
        }
        const updatedWallet = await Wallet.findById(walletId)
        if(!updatedWallet) {
            const error = new Error('No card found.')
            error.code = 404;
            throw error
        }
        if(updatedWallet.owner.toString() !== req.userId.toString()){
            const error = new Error('Not authorized.')
            error.code = 403;
            throw error
        }
        updatedWallet.walletType = walletInput.walletType
        updatedWallet.supplier = walletInput.supplier
        updatedWallet.amount = parseInt(walletInput.amount)
        updatedWallet.shortId = walletInput.shortId
        updatedWallet.color = walletInput.color
        await updatedWallet.save()
        return updatedWallet
    },
}