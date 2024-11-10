const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { getEncryption, getDecryption, hashToken } = require('../util/crypt')

const userSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Company'
    },
    crosWebUserId: {
        type: String,
        required: true,
        trim: true,
    },
    userIdentifierId: {
        type: String,
        required: true,
        trim: true,
    },
    token: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    hashToken: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        select: false
    },
    tokenValidFrom: {
        type: Date,
        default: Date.now,
        required: true,
        select: false
    },
    tokenValidUntil: {
        type: Date,
        required: true,
        select: false
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            delete ret.createdAt;
            delete ret.updatedAt;
            delete ret.__v;

            if (ret.token) {
                ret.decToken = getDecryption(ret.token)
            }
            return ret;
        }
    },
    toObject: {
        transform: (doc, ret) => {
            delete ret.createdAt;
            delete ret.updatedAt;
            delete ret.__v;

            if (ret.token) {
                ret.decToken = getDecryption(ret.token)
            }
            return ret;
        }
    }
})


userSchema.methods.isTokenValideNow = function (JWTTimestamp) {
    if (this.tokenValidFrom) {
        return ((this.tokenValidFrom.getTime() + (30 * 60 * 1000)) / 1000) <= JWTTimestamp
    }
    else {
        return true
    }

};

// generate Token for created user 
userSchema.pre('save', async function (next) {
    if (this.isNew) {
        const companyId = this.companyId
        const token = jwt.sign({ userId: this.id, companyId }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        })
        this.token = getEncryption(token)
        this.hashToken = hashToken(token)
        this.tokenValidFrom = Date.now()
        this.tokenValidUntil = Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN * 60 * 1000)
    }

    next()
})

userSchema.post('save', async function (doc, next) {
    if (doc.token) {
        doc.token = getDecryption(doc.token)
        doc.decToken =  doc.token
    }
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User