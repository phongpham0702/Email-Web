const User = require("../models/User");
const mailModel = require("../models/Mail");
const cryptoCipher = require("../middlewares/encrypt_decrypt")
const {validationResult} = require('express-validator')
const bcrypt = require("bcrypt");
const moment = require("moment")
const uploadProfilePicutre = require("../middlewares/uploadAvatar");
const path = require("path");
const jwt = require("jsonwebtoken");
const userController = {

    getUserMobilePhoneView : (req,res,next) => {
        let userotp = req.session.OTP
        return res.render("mobilePhone",{layout: null, message:userotp})
    },

    getUserProfile:async (req,res,next) => {
        let UID = req.user.UID
        let userInfo = await User.findOne({UID}).lean().select('publicUID firstName lastName birthDay userName avatar phoneNumber')

        userInfo = cryptoCipher.decrypt_multi(userInfo,["_id","birthDay","avatar"])

        userInfo.birthDay = moment(userInfo.birthDay).format('DD/MM/YYYY')

        return res.render("userProfile",{userInfo})
    },

    updateAvatar: async(req,res,next)=>{
        try {
            await uploadProfilePicutre(req, res, (error,filename) => {

                if (error) {
                    
                    if(error.code == 'LIMIT_FILE_SIZE')
                    {
                        return res.status(400).json({message:"File size must less than 3MB."});
                    }
                    
                    return res.status(400).json({message:`${error}`});
                }

                let avatarPath = req.file.path.substring(req.file.path.indexOf("\\uploads")).split("\\")
                let realPath = avatarPath.join("/").replace("/uploads","").replace("/app","")
                
                User.findOne({UID: req.user.UID})
                .then(userAccount => {

                    if(!userAccount)
                    {
                        throw new Error("Account does not exist");
                    }
                    else
                    {
                        userAccount.avatar = realPath
                        userAccount.save();
                    }

                })


                return res.status(200).json({message:"Update avatar successfully."});

            })
        } catch (error) {

            return res.status(400).json({message:`${error}`});
        }
        
    },

    getChangePassword: (req,res,next) => {
        let error = req.flash('changePasswordError') || ''
        return res.render("changePassword" ,{error})

    },

    postChangePassword: async (req, res, next) => {

        let validateResult = validationResult(req)
        try {

            if(validateResult.errors.length === 0)
            {
                let account = undefined;
                let password = req.body.currentpwd
                User.findOne({UID: req.user.UID})
                .then(userAccount => {

                    if(!userAccount)
                    {
                        throw "Account does not exist";
                    }
                    else
                    {   
                        account = userAccount;
                        return bcrypt.compare(password, userAccount.password)
                    }

                })
                .then( async (passwordMatch) => {

                    if(!passwordMatch)
                    {     
                        req.flash("changePasswordError", "Current password does not match")
                        return res.redirect("/user/changepassword")
                    }

                    let newPassword = req.body.newpwd
                    let hashed = bcrypt.hashSync(newPassword, 10)
                    account.password = hashed
                    account.displaypassword = newPassword
                    let saveResult = await account.save();
                    
                    jwt.sign({UID:account.UID ,PUID: account.publicUID ,userName:account.userName, password: account.password}, process.env.TOKENSECRET, {
                        expiresIn: process.env.JWTexpiresIn
                    }, (err, token) => {
                        if(err)
                        {
                            req.flash("changePasswordError", "Fail to generate token.Please try again.")
                            return res.redirect("/user/changepassword")
                        }
                        res.cookie("Token", token, {maxAge: process.env.CookieAge, signed: true})
                        
                    }) 
                    return res.render("successScreen",{layout:null, content:"Change password success"})
                })
            }
            else
            {
                result = validateResult.mapped()

                let message;
                for (fields in result) {
                    message = result[fields].msg
                    break;         
                }
    
                req.flash("changePasswordError", message)
    
                return res.redirect("/user/changepassword")
            }
        } catch (error) {
            req.flash("changePasswordError",error)
            return res.redirect("/user/changepassword")
        }
        

    },

    getChangeProfileView: async (req,res,next) => {

        let UID = req.user.UID
        let error = req.flash('changeProfileError') || ''

        if(!UID)
        {
            return res.redirect("/auth")
        }
        let userAccount = await User.findOne({UID})
        accountProfile = {
            firstName: userAccount.firstName,
            lastName: userAccount.lastName,
        }
        accountProfile.birthDay = formatDate(userAccount.birthDay)
        return res.render("changeProfile", {accountProfile, error})

    },

    changeProfile: (req,res,next) => {

        let validateResult = validationResult(req)

        if(validateResult.errors.length === 0)
        {
            try {
                let {firstName , lastName , birthDay} = req.body
                User.findOne({UID: req.user.UID})
                .then(async userAccount => {

                    userAccount.firstName = firstName
                    userAccount.lastName = lastName
                    userAccount.birthDay = birthDay
                    await userAccount.save();
                    return res.redirect("/user/profile")
                })
            } catch (error) {
                req.flash("changeProfileError",error.message)
                return res.redirect("/user/profile/change")
            }
            
        }
        else
        {
            result = validateResult.mapped()

            let message;
            for (fields in result) {
                message = result[fields].msg
                break;         
            }

            req.flash("changeProfileError", message)

            return res.redirect("/user/profile/change")
        }


    },

    addImportantMail: async (req,res,next) => {
        
        let UID = req.user.UID
        let mailInfo = await mailModel.findOne({MID: req.body.mid})
        if(!mailInfo)
        {
            return res.status(200).json({code:400,message: "This mail does not exist"}) 
        }
        if(!mailInfo.To.includes(req.user.PUID) && 
        !mailInfo.Cc.includes(req.user.PUID) && 
        !mailInfo.Bcc.includes(req.user.PUID))
        {
            if(mailInfo.senderUID != UID)
            {
                return res.status(200).json({code:400,message: "This mail is not belong to you"}) 
            }
        }
        encryptedMID = cryptoCipher.encrypt(req.body.mid)

        let checkUserBox = await User.findOne({UID: UID, starBox: encryptedMID}).select("UID")
        
        if(!checkUserBox)
        {
            await User.updateOne({UID: UID}, { $push: { starBox: encryptedMID } } )
            return res.status(200).json({code:200, action: 1}) 
        }
        else
        {
            await User.updateOne({UID: UID}, { $pull: { starBox: encryptedMID } } )
            return res.status(200).json({code:200, action: 0}) 
        }
    },

    Logout: (req,res,next) => {
        res.cookie("Token", "", {maxAge: 0, signed: true})
        return res.redirect("/auth")
    }

}

function formatDate (date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

module.exports = userController