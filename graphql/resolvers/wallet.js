import User from '../../models/user'
import { uuid } from 'uuidv4'

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
            supplier: walletInput.supplier,
            amount: parseInt(walletInput.amount),
            shortId: walletInput.shortId,
            color: walletInput.color,
            owner: req.userId
        }
        if(['Visa', 'MasterCard'].includes(walletInput.walletType)){
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
                    supplier: walletInput.supplier,
                    amount: parseInt(walletInput.amount),
                    shortId: walletInput.shortId,
                    color: walletInput.color
                }
                if(['Visa', 'MasterCard'].includes(wallet.walletType)){
                    user.wallets[index] = {
                        ...user.wallets[index],
                        creditLimit: walletInput.creditLimit
                    }
                }
            }
        })
        await user.save()
        return user.wallets[updatedWalletIndex]
    },
}