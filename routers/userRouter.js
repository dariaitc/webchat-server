const express = require('express')
const chatRouter = require('./chatRouter')
// const {isBearerTokenValid,useLoggedUserIdsOnQuery} = require('../controllers/authController')
const router = express.Router({ mergeParams: true });

router.use('/:userIdentifierId/chats', chatRouter)

module.exports = router