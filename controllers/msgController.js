const catchAsync = require('../util/catchAsync')
const AppError = require('../util/AppError')
const logger = require("../util/logger");
const handlerFactory = require('./handlerFactory')
const Msg = require("../models/msgModel")
const { createNewChat, getChatById } = require('./chatController')

exports.getChatMsgs = catchAsync(async (req, res, next) => {
    const { chatId } = req.params
    if (!chatId) return next(new AppError('Chat not selected.'))
    req.query = { ...req.query, chatId }
    next()
})

exports.getMsgs = handlerFactory.findAll(Msg)

const insertMessage = async (companyId, userId,
    msgContent = {
        chatId: null,
        msg: '',
        btnList: [],
        msgTime: new Date(),
        author: 'agent' //['client', 'agent']
    }
) => {
    let { chatId, msg, msgTime, author, btnList } = msgContent
    msgTime = msgTime || new Date()
    author = author || 'agent'
    let chat
    let isNewChat = false
    logger.writeLog("msgController").info(`${__filename}: insertMessage() :: companyId=${companyId} userId=${userId} chatId=${chatId} msg=${msg} ButtonList.length=${btnList?.length}  author=${author} msgTime=${msgTime}`)

    if (chatId) {
        chat = await getChatById(companyId, userId, chatId)
        userId = chat.userId
        logger.writeLog("msgController").info(`${__filename}: insertMessage() :: companyId=${companyId} userId=${userId} chatId=${chatId} Chat found.`)
    }
    if (!chat && userId) {
        chat = await createNewChat(companyId, userId)
        isNewChat = true
        chatId = chat._id
        logger.writeLog("msgController").info(`${__filename}: insertMessage() :: companyId=${companyId} userId=${userId} chatId=${chatId} Chat created.`)
    }

    const msgDoc = new Msg({
        companyId,
        userId,
        chatId,
        author,
        msg,
        msgTime,
        btnList
    })

    await msgDoc.save()
    logger.writeLog("msgController").info(`${__filename}: insertMessage() :: companyId=${companyId} userId=${userId} chatId=${chatId} Msg Saved msgId=${msgDoc._id}`)

    chat.latestMsg = msgDoc.msg
    chat.latestMsgTime = msgDoc.msgTime
    chat.latestAuthor = msgDoc.author
    if (author === 'client') {
        chat.latestClientMsgTime = msgDoc.msgTime
    }
    else if (author === 'agent') {
        chat.latestAgentMsgTime = msgDoc.msgTime
    }

    await chat.save()
    logger.writeLog("msgController").info(`${__filename}: insertMessage() :: companyId=${companyId} userId=${userId} chatId=${chatId} chat updated with the latest message`)
    return {
        msg: msgDoc,
        chat,
        isNewChat
    }
}
exports.insertMessage = insertMessage

exports.msgRecivedByWebhook = catchAsync(async (req, res, next) => {
    const { company } = req
    const companyId = company._id
    const io = req.app.get('socketio')
    const { chatId, msg, msgTime, btnList } = req.body
    if (!chatId || !msg) {
        return next(new AppError('Missed body params (chatId,msg)'))
    }

    let msgTimeDate = new Date()
    if (msgTime) msgTimeDate = new Date(msgTime)
    const createdMsgObj = await insertMessage(companyId, undefined, {
        chatId,
        msg,
        btnList,
        msgTime: msgTimeDate,
        author: 'agent'
    })

    const userId = createdMsgObj?.chat?.userId
    if (userId) {
        io.to(`${userId}`).emit('newMessageRecived', createdMsgObj)
    }

    res.status(201).send({
        status: 'success',
        data: {
            msg: createdMsgObj.msg
        }
    })
})

// exports.insertMsgRequest = catchAsync(async (req, res, next) => {
//     const { user: { companyId }, _id: userId } = req
//     const { chatId } = req.params
//     const { msg } = req.body
//     logger.writeLog("msgController").info(`${__filename}: insertMsg() :: companyId=${companyId} userId=${userId} chatId=${chatId} msg=${msg}`)
//     await insertMessage(companyId, userId, chatId, msg)


// })