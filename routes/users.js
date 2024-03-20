const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")
const authenticator = require("../middlewares/authJwt")
const changePasswordValidator = require("../controllers/validators/changePasswordValidator")
const changeProfileValidator = require("../controllers/validators/changeProfileValidator")
const uploadAvatar = require("../middlewares/uploadAvatar.js")
/* GET users listing. */

router.route("/mobilephone").get(userController.getUserMobilePhoneView)


router.use(authenticator)

router.route("/")
.all((req,res,next) => {
   
  return res.redirect("/")

})

router.route("/logout")
.get(userController.Logout)

router.route("/profile")
.get(userController.getUserProfile)

router.route("/upload/avatar")
.post(userController.updateAvatar)

router.route("/profile/change")
.get(userController.getChangeProfileView)
.post(changeProfileValidator ,userController.changeProfile)

router.route("/changepassword")
.get(userController.getChangePassword)
.post(changePasswordValidator , userController.postChangePassword)
module.exports = router;
