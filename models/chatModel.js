const mongoose = require('mongoose')
// const validator = require('validator')
// const bcrypt = require('bcryptjs')
// const jwt = require('jsonwebtoken')


const chatSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Company'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    latestMsg: {
        type: String,
        default: ''
    },
    latestMsgTime: {
        type: Date,
        default: Date.now
        // required: true
    },
    latestAuthor: {
        type: String,
        required: true,
        trim: true,
        enum: {
            values: ['client', 'agent'],
            message: 'author : must be one of the following (client,agent)'
        },
        default: 'client'
    },
    latestAgentMsgTime:{
        type: Date
    },
    latestClientMsgTime:{
        type: Date
    }
}, {
    timestamps: true
})

chatSchema.virtual('msgs', {
    ref: 'Msg',
    localField: '_id',
    foreignField: 'chat'
})


const Chat = mongoose.model('Chat', chatSchema)

module.exports = Chat