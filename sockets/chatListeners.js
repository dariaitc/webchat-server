const logger = require("../util/logger");
const { joinRoom, leftRoom } = require('./onlineUsers')
const chatListeners = async (io, socket) => {
    const { user, company } = socket
    const { companyId, _id: userId } = user

    socket.on('joinChat', ({ chatId }) => {
        joinRoom(userId, 'joinChat', chatId)
        logger.writeLog("chatListeners").info(`${__filename}: on('joinChat') :: companyId=${companyId} userId=${userId} joined chatId=${chatId}`)
        console.log(`${__filename}: on('joinChat') :: companyId=${companyId} userId=${userId} joined chatId=${chatId}`)
    });

    socket.on('leftChat', () => {
        leftRoom(userId,'joinChat')
        logger.writeLog("chatListeners").info(`${__filename}: on('leftChat') :: companyId=${companyId} userId=${userId} chat left`)
        console.log(`${__filename}: on('leftChat') :: companyId=${companyId} userId=${userId} joined chatId=${chatId}`)
    });

}

module.exports = chatListeners