const {check} = require('express-validator')
const User = require('../../models/User')
const loginValidator = [
    check('loginUserName').exists().withMessage('Please enter your user name')
    .notEmpty().withMessage('Please fill in all fields')
    ,

    check('loginPassword').exists().withMessage('Please enter your password')
    .notEmpty().withMessage('Please fill in all fields')
    .isLength({min: 6}).withMessage('Password must contain at least 6 characters')
]

module.exports = loginValidator