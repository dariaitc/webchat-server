const express = require('express')
const { userLogin, createCookiesWithBearerToken } = require('../controllers/authController')
const router = express.Router();


router.route('/login').post(userLogin, createCookiesWithBearerToken)
module.exports = router