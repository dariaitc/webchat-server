
const chalk = require('chalk');
const { getUserBearerToken } = require('../controllers/authController')
const msgListeners = require('./msgListeners')
const chatListeners = require('./chatListeners')
const { onUserLogin, onUserLogout } = require('./onlineUsers')

const setupSocket = (io) => {
    // Middleware to check Bearer token before allowing login
    io.use(async (socket, next) => {
        try {
            const userIdentifierId = socket.handshake.auth.userIdentifierId
            const { user, company } = await getUserBearerToken(socket.handshake.auth, userIdentifierId)
            socket.user = user
            socket.company = company
            next()
        }
        catch (e) {
            return next(new Error('Please Login again'));
        }
    });

    // Handle new connection
    io.on('connection', (socket) => {
        const { user, company } = socket
        console.log(chalk.bgRed.white(`User connected: socketId=${socket.id} companyId=${company._id} userId=${user._id}`));
        onUserLogin(socket, user)

        msgListeners(io, socket)
        chatListeners(io, socket)

        // const userId = socket.handshake.auth.userId;
        // socket.join(userId); // Join a room named after the user's ID

        // // Send notification only to this user
        // io.to(userId).emit('notification', 'You have a new message');

        // const roomId = 'room123'; // Use a unique room ID for each chat or group
        // socket.join(roomId);

        // // Send a message to everyone in the room
        // socket.to(roomId).emit('message', 'Hello everyone in the room!');

        // socket.on('joinChat', ({ chatId, userId, agentId }) => {
        //     socket.join(chatId); // `chatId` is the room name, e.g., user ID or session ID
        //     console.log(`User ${userId} and Agent ${agentId} joined room ${chatId}`);

        //     // Notify other participants in the room
        //     io.to(chatId).emit('message', { sender: 'System', text: 'User and Agent have joined the chat.' });
        //   });


        // Custom event listener
        // socket.on('customEvent', (data) => {
        //     console.log(`Custom event triggered by ${socket.id} with data:`, data);
        //     // Optionally, emit a response back to the client
        //     socket.emit('customEventResponse', { message: 'Custom event processed successfully' });
        // });

        // Handle disconnection
        socket.on('disconnect', (reason) => {
            const { user, company } = socket
            console.log(`User disconnected: socketId=${socket.id} companyId=${company._id} userId=${user._id}`);
            onUserLogout(socket)
        });
    });

}

module.exports = setupSocket

/*
Client side:
socket.emit('customEvent', { key: 'value' }); // to send
socket.on('customEventResponse', (response) => { // to listen
  console.log(response.message); // Expected output: 'Custom event processed successfully'
});
*/