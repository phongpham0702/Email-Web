const {check} = require('express-validator')

const resetPasswordValidator = [

    check('password').exists().withMessage('Please enter password')
    .notEmpty().withMessage('Password cannot be empty')
    .isLength({min: 6}).withMessage('Password must contain at least 6 characters'),

    check('rePassword').exists().withMessage('Please comfirm your password')
    .notEmpty().withMessage('Please enter re-password')
    .custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error('Confirm password is not correct')
        }
        return true;
    })
]

module.exports = resetPasswordValidator