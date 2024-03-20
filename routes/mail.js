const express = require('express');
const router = express.Router();
const mailController = require("../controllers/mailController")
const authenticator = require("../middlewares/authJwt")
const uploadAttach = require("../middlewares/uploadAttach");
const mailValidator = require('../controllers/validators/mailValidator')
const rateLimit = require("express-rate-limit")

const requestLimit = rateLimit({
  windowMs: 60*1000,
  max: 25,
  message: `Too many request from this IP !`
})

router.use(authenticator)

router.route("/")
.all((req,res,next) => {
   
  return res.redirect("/")

})
router.use("/send",requestLimit)
router.route("/send",)
.post(uploadAttach,mailValidator, mailController.sendMail)

router.route("/detail/:id").get(mailController.getMailDetail)

router.route("/search").post(mailController.searchMailSimple)

module.exports = router;
