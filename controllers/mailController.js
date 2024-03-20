const {validationResult} = require('express-validator')
const uuid = require("uuid");
//const io = require("socket.io-client")(`http://localhost:${process.env.PORT}`)
const mailModel = require("../models/Mail");
const User = require('../models/User');
const cryptoCipher = require('../middlewares/encrypt_decrypt');
const { use } = require('../routes');
const mailController = {

    sendMail: async(req,res) => {
        try {

                let result = validationResult(req);
                

                if(result.errors.length === 0)
                {
                    
                    let ToList = req.body.To.split("/")
                    let CcList = req.body.cc.split("/")
                    let BccList = req.body.bcc.split("/")
                    let allReceiver = [...ToList, ...CcList, ...BccList]
                    let uniqueReceiverList = [...new Set(allReceiver)];
                    uniqueReceiverList = uniqueReceiverList.filter(id => id != "")
                    let userDocs;
                    let listOfValidID;
                    let attachList = [];

                    if(allReceiver.includes(req.user.PUID))
                    {
                        return res.status(200).json({code:400,message: "You can not send mail for yourself"})
                    }

                    await User.find({ publicUID: { $in: uniqueReceiverList } })
                    .then(async ( userList) => {
                        
                        if(!userList)
                        {
                            throw "Find receiver fail. Please try again later.";
                        }else
                        {   
                            userDocs = userList 
                            listOfValidID = userDocs.map(user => user.publicUID) 
                        }
                    })
                    for(let i of uniqueReceiverList)
                    {
                        if(!listOfValidID.includes(i))
                        {
                            return res.status(200).json({code:400,message: `The following ID does not exist:<br><b>${i}</b>`});
                        }
                    }

                    if(req.files.length != 0 )
                    {   
                        
                        let tmpPath, realPath;
                        req.files.forEach(file => {
                            
                            tmpPath = file.path.substring(file.path.indexOf("\\uploads")).split("\\")
                            realPath = tmpPath.join("/").replace("/uploads","")
                            attachList.push(realPath)
                        });
                    }//"publicUID UID sentMailsBox receivedMailsBox"
                    let sentDate = new Date()
                    let uuidPreString = `${sentDate}-${req.user.UID}-${req.body.Subject}`;
                    let MID = uuid.v5(uuidPreString, process.env.Namespace)
                    let senderUID = req.user.UID
                    let userReaded = [cryptoCipher.encrypt(req.user.PUID)]   
                    
                    await mailModel.create({
                        MID: MID,
                        senderUID: senderUID,
                        To : ToList,
                        Cc: CcList,
                        Bcc: BccList,
                        title: req.body.Subject,
                        body: req.body.Content,
                        sentDate : sentDate,
                        attachFile: attachList,
                        userReaded: userReaded
                    })
                    
                    let encryptedMID = cryptoCipher.encrypt(MID)
                    await userDocs.forEach(async (user) => {
                        
                        if(ToList.includes(user.publicUID) || CcList.includes(user.publicUID) || BccList.includes(user.publicUID))
                        {       
                            await User.updateOne({UID: user.UID} , { $push: {receivedMailsBox: encryptedMID } } )
                        }
                    })
                    
                    await User.updateOne({UID: req.user.UID}, { $push: { sentMailsBox: encryptedMID } })

                    return res.status(200).json({code:200, message:"send mail success"})
                }
                else
                {
                    result = result.mapped()

                    let message;
                    for (fields in result) {
                        message = result[fields].msg
                        break;         
                    }
                    return res.status(200).json({code:400,message})
                }
                
                  
        } catch (error) {
            console.log(error)
            return res.status(200).json({code:400, message:"An error occurred while sending the message"});
        }
        
    },

    getMailDetail : async(req, res , next) => {

        try {
            let UID = req.user.UID
            let userModel = await User.findOne({UID})
            let userInfo = {
                firstName: userModel.firstName,
                lastName: userModel.lastName,
                avatar: userModel.avatar
            }
            let mailDetail = await mailModel.findOne({MID: req.params.id})
            
            if(!mailDetail)
            {
                return res.render("detailMail",{layout:"mainView",userInfo})
            }
            if((!mailDetail.To.includes(req.user.PUID) && 
            !mailDetail.Cc.includes(req.user.PUID) && 
            !mailDetail.Bcc.includes(req.user.PUID)))
            {   
                if(mailDetail.senderUID != UID)
                {
                    return res.render("detailMail",{layout:"mainView",userInfo,mailDetailError:"You do not have permisson to read this mail"})
                }
                
            }
            let senderInfo = await User.findOne({UID: mailDetail.senderUID})
            let returnRequestMailDetail = {
                MID: mailDetail.MID,
                title: mailDetail.title,
                body: mailDetail.body,
                avatar: senderInfo.avatar,
                firstName: senderInfo.firstName,
                lastName: senderInfo.lastName
            }

            return res.render("detailMail",{layout:"mainView",userInfo, mailDetail: returnRequestMailDetail})
        } catch (error) {
            console.log(error)
            return res.redirect("/")
        }

    },

    searchMailSimple: async (req,res ,next) => {

        try {
          let UID = req.user.UID
          let userInfo = await User.findOne({UID}).lean().select('receivedMailsBox')
          let searchValue = req.body.searchValue
          let searchList = await mailModel.find({ MID: { $in: userInfo.receivedMailsBox }, $text: { $search: `${searchValue}` }}).sort({sentDate: 'desc'}).select("MID senderUID title body sentDate userReaded")
          let viewMailList = await formatMailList(req, searchList)
          return res.status(200).json({code:200,mailList: viewMailList})  
        } catch (error) {
            return res.status(200).json({code:400,message: "No result found"})  
        }
        
    }

}

async function formatMailList(req,rawMaterial)
{
  let d = new Date()
  let formatMailList = []
  for(let mail of rawMaterial)
  {
    let senderName = await User.findOne({UID: mail.senderUID}).select("firstName lastName")
    let obj = {
      MID: mail.MID,
      senderName: senderName.firstName + " " +senderName.lastName,
      title: mail.title,
      body: mail.body,
      
    }
    if (mail.sentDate.getFullYear() === d.getFullYear() && mail.sentDate.getMonth() === d.getMonth() && mail.sentDate.getDate() === d.getDate()) {
      let minutes = mail.sentDate.getMinutes().toString().padStart(2, '0');
      if(mail.sentDate.getHours() <= 12)
      {
        obj.sentDate = `${mail.sentDate.getHours()}:${minutes} am`;
      }
      else
      {
        obj.sentDate = `${mail.sentDate.getHours()}:${minutes} pm`;
      }
    } else {
      obj.sentDate = moment(mail.sentDate).format('DD/MM/YYYY');
    }

    if(!mail.userReaded.includes(req.user.PUID))
    {
      obj.isReaded = 'unread';
    }
    else
    {
      obj.isReaded = '';
    }
    formatMailList.push(obj)
  }

  return formatMailList
}


module.exports = mailController