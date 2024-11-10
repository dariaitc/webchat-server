const { insertMessage } = require('../controllers/msgController')
const { sendWebHookOnNewMsg } = require('../controllers/companyController')
const msgListeners = async (io, socket) => {
    const { user, company } = socket
    socket.on('sendMsg', async (msgContentTemp) => {
        const msgContent = { ...msgContentTemp, author: 'client' }
        // msgContent = {
        //     chatId: null,
        //     msg: '',
        //     msgTime: new Date(),
        //     author: 'agent' //['client', 'agent']
        // }
        const createdMsgObj = await insertMessage(user.companyId, user._id, msgContent)
        sendWebHookOnNewMsg(createdMsgObj.msg)
        io.to(`${user._id}`).emit('newMessageRecived', createdMsgObj)

    });
}

module.exports = msgListeners