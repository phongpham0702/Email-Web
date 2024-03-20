const {check} = require('express-validator')
const User = require('../../models/User');
const checkSpecialCharacterPattern = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/g;
const onlyNumbersPattern = /^[0-9]+$/;
const registerValidator = [
    check('firstName').exists().withMessage({title:"Missing information!" , message: 'Please make sure you have filled all the information'})
    .notEmpty().withMessage({title:'Missing information!',message:'Please fill in all fields'})
    .not()
    .matches(checkSpecialCharacterPattern).withMessage({title:'Invalid information!',message:'First name cannot contain special characters'}),

    check('lastName').exists().withMessage({title:"Missing information!" , message: 'Please make sure you have filled all the information'})
    .notEmpty().withMessage({title:'Missing information!',message:'Please fill in all fields'})
    .not()
    .matches(checkSpecialCharacterPattern).withMessage({title:'Invalid information!',message:'Last name cannot contain special characters'}),

    check('userName').exists().withMessage({title:"Missing information!" , message: 'Please make sure you have filled all the information'})
    .notEmpty().withMessage({title:'Missing information!',message:'Please fill in all fields'})
    .not()
    .matches(checkSpecialCharacterPattern).withMessage({title:'Invalid information!',message:'User name cannot contain special characters'})
    .isLength({min: 6}).withMessage({title:'Invalid information!',message:'User name must contains at least 6 characters'})
    .custom((value) => {

        return User.findOne({userName: value})
        .then(user => {
            if (user) {
                return Promise.reject({title:'Something went wrong!',message:'This user name has been taken'})
            }
            
        })
    }),


    check('birthDay').exists().withMessage({title:"Missing information!" , message: 'Please make sure you have filled all the information'})
    .notEmpty().withMessage({title:'Missing information!',message:'Please fill in all fields'})
    .isDate().withMessage({title:'Something went wrong!',message:'Invalid birthday'})
    .custom((value) => {

        let isValidBirthday = true
        let todayIs = new Date(Date.now())
        let userBirthday = new Date(value)
        
        if(userBirthday.getFullYear() > todayIs.getFullYear())

        { isValidBirthday = false}

        else if((userBirthday.getMonth() > todayIs.getMonth()) 
        && (userBirthday.getFullYear() == todayIs.getFullYear()))

        {isValidBirthday = false}

        else if((userBirthday.getDate() > todayIs.getDate()) && 
        (userBirthday.getMonth() == todayIs.getMonth()) && 
        (userBirthday.getFullYear() == todayIs.getFullYear()))

        {isValidBirthday = false}

        return isValidBirthday
    }).withMessage({title:"Missing information!" ,message:'Invalid birthday'})
    ,

    check('phoneNumber').exists().withMessage({title:"Missing information!" , message: 'Please make sure you have filled all the information'})
    .notEmpty().withMessage({title:'Missing information!',message:'Please fill in all fields'})
    .isLength({min: 10, max: 11}).withMessage({title:'Invalid information!',message:'Phone number must contains at least 10 characters'})
    .matches(onlyNumbersPattern).withMessage({title:'Invalid information!',message:'Phone number does not valid'})
    .custom((value) => {
        return User.findOne({phoneNumber: value})
        .then(user => {
            if(user)
            {
                return Promise.reject({title:'Something went wrong!',message:'This phone number has been taken'})
            }
        })
    }),

    check('password').exists().withMessage({title:"Missing information!" , message: 'Please make sure you have filled all the information'})
    .notEmpty().withMessage({title:'Missing information!',message:'Please fill in all fields'})
    .isLength({min: 12}).withMessage({title:'Invalid information!',message:'Password must contain at least 12 characters'})
    .matches(/[a-zA-Z]/).withMessage({title:'Invalid information!',message:'Password must contain at least 1 letter'})
    .matches(/\d/).withMessage({title:'Invalid information!',message:'Password must contain at least 1 number'})
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage({title:'Invalid information!',message:'Password must contain at least 1 special character'}),

    check('rePassword').exists().withMessage({title:"Missing information!" , message: 'Please make sure you have filled all the information'})
    .notEmpty().withMessage({title:'Missing information!',message:'Please fill in all fields'})
    .custom((value, {req}) => {
        return value === req.body.password;
    }).withMessage({title:'Confirm password is not correct' ,message:'Confirm password is not correct'})
]

module.exports = registerValidator