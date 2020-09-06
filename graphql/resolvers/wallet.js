import User from '../../models/user.js'
import pkg from 'uuidv4'
const { uuid } = pkg

export default {
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
            name: walletInput.name,
            amount: parseInt(walletInput.amount),
            color: walletInput.color,
        }
        if(walletInput.walletType === 'Credit card'){
            newWallet.creditLimit = parseInt(walletInput.creditLimit)
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
                    name: walletInput.name,
                    amount: parseInt(walletInput.amount),
                    color: walletInput.color,
                    creditLimit: walletInput.walletType === 'Credit card' ? walletInput.creditLimit : null
                }
            }
        })
        await user.save()
        return user.wallets[updatedWalletIndex]
    },
}