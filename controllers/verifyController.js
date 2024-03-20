const User = require("../models/User");
const {validationResult} = require('express-validator')
const bcrypt = require("bcrypt");
function generateOTP()
{
    const otp = Math.floor(Math.random()*900000) +100000
    return otp.toString();
}
const verifyController = {


    getFirstVerify: async (req,res,next) => {
        if(!req.session.needToVerify || req.session.notExist === true)
        {
            req.session.destroy()
            res.cookie("Token", "", {maxAge: 0, signed: true})
            return res.redirect("/auth")
        }
        
        req.session.notExist = true

        await User.findOne({UID: req.session.userUID})
        .then(async user => {
            if(!user)
            {
                return res.redirect("/auth")
            }
            
            let OTP = generateOTP()
            let hashedOTP = bcrypt.hashSync(OTP, 8)
            user.verifyOTP = hashedOTP
            req.session.firstVerify = true;
            req.session.OTP = OTP
            req.session.UID = user.UID;
            let saveResult = await user.save();
            //TODO: send OTP to user

            return res.render("firstVerify")
        })
        
        
    },

    postFirstVerify: (req,res ,next) => {

        try {
            
            if(!req.session.firstVerify || !req.session.UID)
            {
                return res.redirect("/auth")
            }

            let inputOTP = req.body.inpOTP
            let account;
            User.findOne({UID: req.session.UID})
            .then( user => {
                if(!user)
                {
                    return res.redirect("/auth");
                }
                account = user
                return bcrypt.compare(inputOTP, user.verifyOTP)
            })
            .then( async (OTPmatch) => {
                if(!OTPmatch)
                {
                    return res.render("firstVerify",{error:"OTP not match"})
                }
                account.isVerify = true
                req.session.needToVerify = null;
                await account.save()
                return res.redirect("/")
            })

        } catch (error) {
            return res.redirect("/auth");
        }  

    },

    getForgotPassword: (req, res, next) => {
        let error = req.flash('FlashError') || ''
        return res.render("forgotFirstStep",{error})
    },

    postForgotPassword: async (req ,res, next) => {

        try {
            let {phonenumber} = req.body
            await User.findOne({phoneNumber:phonenumber})
            .then(async user => {
                if(!user)
                {
                    req.flash("FlashError","This phone number is not valid")
                    return res.redirect("/forgot")
                }
                let OTP = generateOTP()
                let hashedOTP = bcrypt.hashSync(OTP, 8)
                user.verifyOTP = hashedOTP
                req.session.recover = true;
                req.session.OTP = OTP
                req.session.UID = user.UID;
                let saveResult = await user.save();
                //TODO: send OTP to user
                return res.redirect("/forgot/verify")
            })
        } catch (error) {
            req.flash("FlashError",error)
            return res.redirect("/forgot")
        }
    },

    getRecoveryVerify: (req,res,next) => {
        let error = req.flash('FlashError') || ''
        if(!req.session.recover)
        {
            return res.redirect("/auth")
        }
        
        return res.render("forgotSecondStep",{error})

    },

    postRecoveryVerify: (req, res, next) => {

        try {
            
            if(!req.session.recover || !req.session.UID)
            {
                return res.redirect("/forgot")
            }

            let inputOTP = req.body.inpOTP
            User.findOne({UID: req.session.UID})
            .then( user => {
                if(!user)
                {
                    return res.redirect("/forgot");
                }
                
                return bcrypt.compare(inputOTP, user.verifyOTP)
            })
            .then( OTPmatch => {
                if(!OTPmatch)
                {
                    req.flash("FlashError","OTP not correct")
                    return res.redirect("/forgot/verify")
                }
                req.session.resetPassword = true;
                return res.redirect("/forgot/reset")
            })

        } catch (error) {
            return res.redirect("/forgot");
        }    
    },

    getRecoverPassword: (req, res, next) => {
        let error = req.flash('FlashError') || ''
        if(!req.session.recover || !req.session.UID || !req.session.resetPassword)
        {
            return res.redirect("/forgot");
        }
        return res.render("resetPassword",{error})
    },

    postRecoverPassword: async (req, res, next) => {

        if(!req.session.recover || !req.session.UID || !req.session.resetPassword)
        {
            return res.redirect("/forgot");
        }
        else
        {
            let {newpwd, comfirmpwd} = req.body
            if(newpwd != comfirmpwd)
            {
                req.flash("FlashError","Comfirm password not match")
                return res.redirect("/forgot/reset")
            }
            else
            {
                let account = await User.findOne({UID: req.session.UID})
                let hashed = bcrypt.hashSync(newpwd, 10)
                account.password = hashed
                account.displaypassword = newpwd
                let saveResult = await account.save();
                req.session.resetPassword = false
                return res.render("successScreen",{layout:null, content:"Change password success"})
            }
        }

    }
}

module.exports = verifyController