const express = require('express');
const authController = require("../controllers/authController");
const registerValidator = require('../controllers/validators/registerValidator')
const loginValidator = require("../controllers/validators/loginValidator")
const router = express.Router();
const rateLimit = require("express-rate-limit")

const requestLimit = rateLimit({
  windowMs: 60*1000,
  max: 25,
  message: `<div style="width:100%; 
  text-align:center; 
  background-color:red; 
  color:white;
  padding:8px;
  font-size:32px;font-weight:700">Too many request from this IP !</div>`
})
router.route("/")
.get(authController.getLoginPage)
.post(requestLimit,loginValidator,authController.postLoginPage);

router.route("/register")
.post(requestLimit,registerValidator,authController.postRegisterPage);


module.exports = router