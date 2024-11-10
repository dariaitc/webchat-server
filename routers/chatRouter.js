const express = require('express')
const { getChats } = require('../controllers/chatController')
const { isBearerTokenValid, useLoggedUserIdsOnQuery } = require('../controllers/authController')
const msgRouter = require('./msgRouter')

const router = express.Router({ mergeParams: true });
router.use('/:chatId/msgs', msgRouter)
router.route('/').get(isBearerTokenValid, useLoggedUserIdsOnQuery, getChats)


module.exports = router