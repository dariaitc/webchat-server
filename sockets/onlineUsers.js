const onlineUsers = []

const onUserLogin = (socket, user) => {
    const insertUserObj = {
        ...user._doc,
        socket,
        joinChat: null,
        userRoom: null
    }
    // const existingUserIndex = onlineUsers.findIndex((userObj => userObj._id.toString() === insertUserObj._id.toString()))
    // if (existingUserIndex > -1) {
    // leftRoom(onlineUsers[existingUserIndex]._id, 'userRoom')
    // onlineUsers.splice(existingUserIndex, 1, insertUserObj)
    //     joinRoom(insertUserObj._id, 'userRoom', insertUserObj._id)
    // }
    // else {
    onlineUsers.push(insertUserObj)
    joinRoom(socket, 'userRoom', insertUserObj._id)
    // }
}
exports.onUserLogin = onUserLogin

const onUserLogout = (socket) => {
    // const existingUserIndex = onlineUsers.findIndex((userObj => userObj._id.toString() === user._id.toString()))
    const existingUserIndex = onlineUsers.findIndex((userObj => userObj.socket.id === socket.id))
    if (existingUserIndex > -1) {
        leftRoom(socket, 'userRoom')
        onlineUsers.splice(existingUserIndex, 1)
    }
}
exports.onUserLogout = onUserLogout

const joinRoom = (socket, roomName, roomValue) => {
    // const existingUser = onlineUsers.find(userObj => userObj._id.toString() === userId.toString())
    const existingUser = onlineUsers.find((userObj => userObj.socket.id === socket.id))
    if (existingUser) {
        // const { socket } = existingUser
        if (existingUser[roomName]) {
            socket.leave(existingUser[roomName])
        }
        const roomStringValue = `${roomValue}`
        socket.join(roomStringValue)
        existingUser[roomName] = roomStringValue
    }
}
exports.joinRoom = joinRoom

const leftRoom = (socket, roomName) => {
    // const existingUser = onlineUsers.find(userObj => userObj._id.toString() === userId.toString())
    const existingUser = onlineUsers.find((userObj => userObj.socket.id === socket.id))
    if (existingUser) {
        // const { socket } = existingUser
        if (existingUser[roomName]) {
            socket.leave(existingUser[roomName])
        }
        existingUser[roomName] = null
    }
}
exports.leftRoom = leftRoom