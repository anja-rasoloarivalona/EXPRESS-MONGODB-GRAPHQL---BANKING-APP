import jwt from 'jsonwebtoken'

// const jwt = require('jsonwebtoken')

export default (req, res, next) => {
    const authHeader = req.get('Authorization')
    if(!authHeader){
        req.isAuth = false
        console.log('no auth header')
        return next()
    }
    const token = authHeader.split(' ')[1];
    let decodeToken;
    try {
      decodeToken = jwt.verify(token, 'infiowenfew123')
    } catch (err) {
        req.isAuth = false
        return next()
    }
    if(!decodeToken){
        req.isAuth = false
        return next()
    }
    req.userId = decodeToken.userId
    req.isAuth = true
    next()
}