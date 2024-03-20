const {check} = require('express-validator')
const checkSpecialCharacterPattern = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/g;
const changeProfileValidator = [
    check('firstName').exists().withMessage( 'Please make sure you have filled all the information')
    .notEmpty().withMessage('Please fill in all fields')
    .not()
    .matches(checkSpecialCharacterPattern).withMessage('First name cannot contain special characters'),

    check('lastName').exists().withMessage( 'Please make sure you have filled all the information')
    .notEmpty().withMessage('Please fill in all fields')
    .not()
    .matches(checkSpecialCharacterPattern).withMessage('Last name cannot contain special characters'),

    
    check('birthDay').exists().withMessage( 'Please make sure you have filled all the information')
    .notEmpty().withMessage('Please fill in all fields')
    .isDate().withMessage('Invalid birthday')
    ,

]

module.exports = changeProfileValidator