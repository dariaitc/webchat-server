const express = require('express')
const { getMsgs, getChatMsgs,msgRecivedByWebhook } = require('../controllers/msgController')
const { isBearerTokenValid, useLoggedUserIdsOnQuery, isCompanyBearerTokenValid } = require('../controllers/authController')

const router = express.Router({ mergeParams: true });
router.route('/').get(isBearerTokenValid, useLoggedUserIdsOnQuery, getChatMsgs, getMsgs)
router.route('/').post(isCompanyBearerTokenValid, msgRecivedByWebhook)

module.exports = router