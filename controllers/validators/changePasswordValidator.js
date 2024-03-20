const {check} = require('express-validator')
const changePasswordValidator = [

    check('currentpwd').exists().withMessage("Please enter current password")
    .notEmpty().withMessage("Please enter current password")
    ,

    check('newpwd').exists().withMessage('Please enter new password')
    .notEmpty().withMessage('New password cannot be empty')
    .isLength({min: 12}).withMessage('Password must contain at least 6 characters')
    .matches(/[a-zA-Z]/).withMessage({title:'Invalid information!',message:'Password must contain at least 1 letter'})
    .matches(/\d/).withMessage({title:'Invalid information!',message:'Password must contain at least 1 number'})
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage({title:'Invalid information!',message:'Password must contain at least 1 special character'})
    ,

    check('comfirmpwd').exists().withMessage('Please comfirm your password')
    .notEmpty().withMessage('Please enter comfirm password')
    .custom((value, {req}) => {
        if (value !== req.body.newpwd) {
            throw new Error('Confirm password is not correct')
        }
        return true;
    })
]

module.exports = changePasswordValidator