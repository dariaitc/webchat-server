const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        select: false
        // validate: [(value) => stringCheck(value, { minChars: 2, maxChars: 30, locale: 'en-US', supportedChars: 'ONLY_LETTERS_AND_NUMBERS_WITH_DASH' }), 'Company name must be between 2 and 30 chars with numbers and english chars']
    },
    parentHostList: [
        {
            type: String,
            trim: true,
            unique: true,
            select: false
        }
    ],
    adminEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        select: false
        // validate: [validator.isEmail, 'Email is invalid']
    },
    adminPhone: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        select: false
        // validate: [(value) => validator.isMobilePhone(value, "he-IL"), 'phone number must be in currect format and from israel']
    },
    isActive: {
        type: Boolean,
        select: true,
        default: true
    },
    iconUrl: { // Most of the time the logo of the company
        type: String,
        required: true
    },
    iconLabel: { // Most of the time the company name
        type: String,
        trim: true,
        required: true
    },
    iconDesc: {
        type: String,
        trim: true,
        default: 'איך אנחנו יכולים לעזור?',
        required: true
    },
    themeType: {
        type: String,
        default: 'blue',
        enum: {
            values: ['blue'],
            message: 'themeType : Please use one og the following values (blue)'
        },
        required: true
    },
    onNewMsgWegHookPost: {
        type: String,
        trim: true,
        required: true
    },
    onNewMsgWegHookPostToken: {
        type: String,
        trim: true,
        required: true
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            delete ret.createdAt;
            delete ret.updatedAt;
            delete ret.__v;
            return ret;
        }
    },
    toObject: {
        transform: (doc, ret) => {
            delete ret.createdAt;
            delete ret.updatedAt;
            delete ret.__v;
            return ret;
        }
    }
})
companySchema.methods.generateCompanyToken = (companyId) => {
    const token = jwt.sign({ companyId }, process.env.JWT_SECRET_COMPANY)

    return token
}

// tempcallSchema.index({ callId: 1 }, { unique: true })

const Company = mongoose.model('Company', companySchema)

module.exports = Company