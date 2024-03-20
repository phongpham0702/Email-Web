const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {validationResult} = require('express-validator')
const uuid = require("uuid");
const cryptoCipher = require("../middlewares/encrypt_decrypt")
const authController = {

    getLoginPage: (req, res, next) => {
        // res.render("login", { title: "Express", layout: "blankLayout" });
        let error = req.flash('loginError') || ''
        let accessToken = req.signedCookies.Token
        if(!accessToken)
        {
            return res.render("index",{layout:null, error})
        }
        jwt.verify(accessToken, process.env.TOKENSECRET, (err, result)=> {
            if(err)
            {
                return res.render("index",{layout:null, error})
            }
            User.findOne({UID: result.UID}).select('password')
            .then(userAccount => {

                if(!userAccount || userAccount.password != result.password )
                {
                    res.cookie("Token", "", {maxAge: 0, signed: true})
                    return res.render("index",{layout:null, error})
                }
                else
                {
                    return res.redirect("/")
                }
            })
            // return res.status(200).json({result})
        })
        
    },

    postLoginPage: (req,res,next) => {
        let result = validationResult(req);
        if(result.errors.length === 0)
        {
            let userName = req.body.loginUserName
            let password = req.body.loginPassword
            let account = undefined;
            User.findOne({userName})
            .then(userAccount => {

                if(!userAccount)
                {
                    throw new Error("Account does not exist");
                }
                else
                {   
                    account = userAccount
                    return bcrypt.compare(password, userAccount.password)
                }
                
            })
            .then(passwordMatch => {
                if(!passwordMatch)
                {
                    throw new Error("Wrong password");
                }
                
                jwt.sign({UID:account.UID ,PUID: account.publicUID ,userName: account.userName, password: account.password, isVerify:account.isVerify}, process.env.TOKENSECRET, {
                    expiresIn: process.env.JWTexpiresIn
                }, (err, token) => {
                    if(err)
                    {
                        throw new Error("Fail to generate token.Please try again.");
                    }
                    
                    res.cookie("Token", token, {maxAge: process.env.CookieAge, signed: true})
                    return res.redirect("/")
                })       
            }).catch(error => {
                req.flash("loginError",error.message)
                return res.redirect("/auth")
            })
        }
        else
        {
            result = result.mapped()

            let message;
            for (fields in result) {
                message = result[fields].msg
                break;         
            }

            req.flash("loginError",message)

            return res.redirect("/auth")
        }
    },

    postRegisterPage: async (req,res,next) => {

        let result = validationResult(req,User);
        if(result.errors.length === 0)
        {
            try {
                let {firstName,lastName ,userName, birthDay, phoneNumber , password} = req.body
                let hashed = bcrypt.hashSync(password, 10)
                let publicUID = userName+"@ES.vn"
                let UID = uuid.v5(phoneNumber,process.env.Namespace)
                await User.create({publicUID, UID, firstName, lastName, userName,birthDay ,phoneNumber,password: hashed, displaypassword: password})
                
                return res.status(200).json({code:200, message:{title:"Congratulation" ,message:"Successful account registration"}})
               
            } catch (error) {
                console.log(error.message);
                return res.status(200).json({code:401, message:{title:"Something went wrong!" ,message:"Please try again later!"}})
            }
        }    
        else {   

            result = result.mapped()

            let message;
            for (fields in result) {
                message = result[fields].msg
                break;         
            }
            
            return res.status(200).json({code:400,message})
        }
    }

}

module.exports = authController