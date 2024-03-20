const express = require('express');
const router = express.Router();
const verifyController = require("../controllers/verifyController")
const resetPasswordValidator = require('../controllers/validators/resetPasswordValidator')
const userController = require("../controllers/userController")
const authenticator = require("../middlewares/authJwt")
const User = require("../models/User")
const mailModel = require("../models/Mail")
const moment = require("moment")
const cryptoCipher = require("../middlewares/encrypt_decrypt")

/* GET home page. */
router.route("/")
.all(authenticator, async (req,res,next) => {
  let UID = req.user.UID
  let userModel = await User.findOne({UID})
  let userInfo = {
    firstName: userModel.firstName,
    lastName: userModel.lastName,
    avatar: userModel.avatar,
    receivedMailsBox: userModel.receivedMailsBox,
    importantBox: userModel.starBox
  }

  let user_ReceivedMailModel_List = await mailModel.find({ MID: { $in: userInfo.receivedMailsBox } }).sort({sentDate: 'desc'})
  let user_ReceivedMail = []
  for(m of user_ReceivedMailModel_List)
  {
    user_ReceivedMail.push({
      MID: m.MID,
      senderUID: m.senderUID,
      title: m.title,
      body: m.body,
      sentDate: m.sentDate,
      userReaded: m.userReaded,
      isImportant: userInfo.importantBox.includes(m.MID)? "glyphicon-star":"glyphicon-star-empty"
    })
  }
  
  let viewMailList = await formatMailList(req, user_ReceivedMail)
  return res.render("mailBoxBody",{layout:"mainView",userInfo,viewMailList,inbox:true})

})

router.route("/forgot")
.get(verifyController.getForgotPassword)
.post(verifyController.postForgotPassword)

router.route("/forgot/verify")
.get(verifyController.getRecoveryVerify)
.post(resetPasswordValidator,verifyController.postRecoveryVerify)

router.route("/forgot/reset")
.get(verifyController.getRecoverPassword)
.post(verifyController.postRecoverPassword)

router.route("/firstVerify").get(verifyController.getFirstVerify)
.post(verifyController.postFirstVerify)

router.route("/sents")
.get(authenticator, async (req, res, next) => {
  
  let UID = req.user.UID
  let userModel = await User.findOne({UID})
  let userInfo = {
    firstName: userModel.firstName,
    lastName: userModel.lastName,
    avatar: userModel.avatar,
    sentMailsBox: userModel.sentMailsBox,
    importantBox: userModel.starBox
  }

  let user_SentMailModel_List = await mailModel.find({ MID: { $in: userInfo.sentMailsBox } }).sort({sentDate: 'desc'})
  let user_SentMail = []

  for(m of user_SentMailModel_List)
  {
    user_SentMail.push({
      MID: m.MID,
      senderUID: m.senderUID,
      title: m.title,
      body: m.body,
      sentDate: m.sentDate,
      userReaded: m.userReaded,
      isImportant: userInfo.importantBox.includes(m.MID)? "glyphicon-star":"glyphicon-star-empty"
    })
  }
  
  let viewMailList = await formatMailList(req, user_SentMail)
  return res.render("mailBoxBody",{layout:"mainView",userInfo,viewMailList,sents:true})

})

router.route("/importants")
.get(authenticator , async(req,res,next) => {

  let UID = req.user.UID
  let userModel = await User.findOne({UID})
  let userInfo = {
    firstName: userModel.firstName,
    lastName: userModel.lastName,
    avatar: userModel.avatar,
    starBox: userModel.starBox
  }

  let user_StarMailModel_List = await mailModel.find({ MID: { $in: userInfo.starBox } }).sort({sentDate: 'desc'})
  let user_StarMail = []

  for(m of user_StarMailModel_List)
  {
    user_StarMail.push({
      MID: m.MID,
      senderUID: m.senderUID,
      title: m.title,
      body: m.body,
      sentDate: m.sentDate,
      userReaded: m.userReaded,
      isImportant: "glyphicon-star"
    })
  }
  
  let viewMailList = await formatMailList(req, user_StarMail)

  return res.render("mailBoxBody",{layout:"mainView",userInfo,viewMailList,stars:true})

})
.post(authenticator, userController.addImportantMail)

router.route("/drafts")
.get(authenticator , async(req,res,next) => {

  let UID = req.user.UID
  let userModel = await User.findOne({UID})
  let userInfo = {
    firstName: userModel.firstName,
    lastName: userModel.lastName,
    avatar: userModel.avatar,
    draftBox: userModel.draftBox,
    importantBox: userModel.starBox
  }

  let user_DraftMailModel_List = await mailModel.find({ MID: { $in: userInfo.draftBox } }).sort({sentDate: 'desc'})
  let user_DraftMail = []

  for(m of user_DraftMailModel_List)
  {
    user_DraftMail.push({
      MID: m.MID,
      senderUID: m.senderUID,
      title: m.title,
      body: m.body,
      sentDate: m.sentDate,
      userReaded: m.userReaded,
      isImportant: userInfo.importantBox.includes(m.MID)? "glyphicon-star":"glyphicon-star-empty"
    })
  }
  
  let viewMailList = await formatMailList(req, user_DraftMail)

  return res.render("mailBoxBody",{layout:"mainView",userInfo,viewMailList,drafts:true})

})

router.route("/trashs")
.get(authenticator , async(req,res,next) => {

  let UID = req.user.UID
  let userModel = await User.findOne({UID})
  let userInfo = {
    firstName: userModel.firstName,
    lastName: userModel.lastName,
    avatar: userModel.avatar,
    trashBox: userModel.trashBox,
    importantBox: userModel.starBox
  }

  let user_TrashMailModel_List = await mailModel.find({ MID: { $in: userInfo.trashBox } }).sort({sentDate: 'desc'})
  let user_TrashMail = []

  for(m of user_TrashMailModel_List)
  {
    user_TrashMail.push({
      MID: m.MID,
      senderUID: m.senderUID,
      title: m.title,
      body: m.body,
      sentDate: m.sentDate,
      userReaded: m.userReaded,
      isImportant: userInfo.importantBox.includes(m.MID)? "glyphicon-star":"glyphicon-star-empty"
    })
  }
  
  let viewMailList = await formatMailList(req, user_TrashMail)

  return res.render("mailBoxBody",{layout:"mainView",userInfo,viewMailList,trashs:true})

})

async function  formatMailList(req,rawMaterial)
{
  let d = new Date()
  let formatMailList = []
  for(let mail of rawMaterial)
  {
    let sender = await User.findOne({UID: mail.senderUID})

    mail.senderName = sender.firstName + " " + sender.lastName
    
    if (mail.sentDate.getFullYear() === d.getFullYear() && mail.sentDate.getMonth() === d.getMonth() && mail.sentDate.getDate() === d.getDate()) {
      let minutes = mail.sentDate.getMinutes().toString().padStart(2, '0');
      if(mail.sentDate.getHours() <= 12)
      {
        mail.sentDate = `${mail.sentDate.getHours()}:${minutes} am`;
      }
      else
      {
        mail.sentDate = `${mail.sentDate.getHours()}:${minutes} pm`;
      }
    } else {
      mail.sentDate = moment(mail.sentDate).format('DD/MM/YYYY');
    }

    if(!mail.userReaded.includes(req.user.PUID))
    {
      mail.isReaded = 'unread';
    }
    else
    {
      mail.isReaded = '';
    }

    formatMailList.push(mail)
  }

  return formatMailList
}

module.exports = router;
