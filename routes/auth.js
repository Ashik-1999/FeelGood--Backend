const router = require("express").Router();
const User = require('../Models/User Scema/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const maxAge = 3 * 24 * 60 * 60;
const userAuthController = require('../controllers/userAuthController')

require('dotenv').config()

 
router.post('/register',userAuthController.userRegister)

router.post('/login',userAuthController.userLogin)
 
 
module.exports = router 