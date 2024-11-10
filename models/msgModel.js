const mongoose = require('mongoose')
// const validator = require('validator')
// const bcrypt = require('bcryptjs')
// const jwt = require('jsonwebtoken')

const msgSchema = new mongoose.Schema({
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
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Chat'
    },
    author: {
        type: String,
        required: true,
        trim: true,
        enum: {
            values: ['client', 'agent'],
            message: 'author : must be one of the following (client,agent)'
        }
    },
    msg: {
        type: String
    },
    btnList: [
        {
            label: {
                type: String
            },
            value: {
                type: String
            }
        }
    ],
    msgTime: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    timestamps: true
})

const Msg = mongoose.model('Msg', msgSchema)

module.exports = Msg