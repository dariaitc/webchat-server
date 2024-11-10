const catchAsync = require('../util/catchAsync')
const AppError = require('../util/AppError')
const logger = require("../util/logger");
const handlerFactory = require('./handlerFactory')
const Chat = require("../models/chatModel")

exports.getChats = handlerFactory.findAll(Chat)

const getChatById = async (companyId, userId, chatId) => {
    logger.writeLog("chatController").info(`${__filename}: getChatById() :: companyId=${companyId} userId=${userId} chatId=${chatId}`)
    if (!companyId || !chatId ) {
        logger.writeLog("chatController").error(`${__filename}: getChatById() :: companyId=${companyId} userId=${userId} chatId=${chatId} Some data was missed`)
        throw new AppError('Some data was missed', 400)
    }
    const chat = await Chat.findOne({
        companyId,
        _id: chatId
    })

    return chat
}
exports.getChatById = getChatById

const createNewChat = async (companyId, userId) => {
    logger.writeLog("chatController").info(`${__filename}: createNewChat() :: companyId=${companyId} userId=${userId}`)
    if (!companyId || !userId) {
        logger.writeLog("chatController").error(`${__filename}: createNewChat() :: companyId=${companyId} userId=${userId} Some data was missed`)
        throw new AppError('Some data was missed', 400)
    }
    const chat = new Chat({
        companyId,
        userId
    })
    await chat.save()

    return chat
}
exports.createNewChat = createNewChat

// catchAsync(async (req, res, next) => {
//     const { user: { companyId, _id: userId } } = req
//     logger.writeLog("chatController").info(`${__filename}: getChats() :: companyId=${companyId} userId=${userId}`)
//     if (!companyId || !userId) return next(new AppError('Something went wrong, please contact system administrator.'))

//     const chats = await Chat.find({ companyId, userId })
//     logger.writeLog("chatController").info(`${__filename}: getChats() :: companyId=${companyId} userId=${userId} chats.length=${chats.length}`)

//     res.send({
//         status:'success',
//         data:{
//             chats
//         }
//     })
// })