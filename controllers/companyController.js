
const catchAsync = require('../util/catchAsync')
const AppError = require('../util/AppError')
const logger = require("../util/logger");
const Company = require('../models/companyModel')
const axios = require('axios')
const {getDecryption} = require('../util/crypt')

exports.createCompany = catchAsync(async (req, res, next) => {
    const { companyName, parentHostList, adminEmail, adminPhone, iconUrl, iconLabel, iconDesc, themeType } = req.body
    logger.writeLog("companyController")
        .info(`${__filename}: createCompany() :: companyName=${companyName} adminEmail=${adminEmail} adminPhone=${adminPhone} iconUrl=${iconUrl} iconLabel=${iconLabel} iconDesc=${iconDesc} themeType=${themeType} parentHostListJson=${JSON.stringify(parentHostList)}`)

    const company = Company.create({
        ...req.body
    })
    res.status(201).toJson({
        status: 'success',
        data: { company }
    })
})

exports.generateCompanyToken = catchAsync(async (req, res, next) => {
    const { companyId } = req.body
    logger.writeLog("companyController")
        .info(`${__filename}: generateCompanyToken() :: companyId=${companyId}`)
    const company = await Company.findById(companyId)
    if (!company?.isActive) {
        return next(new AppError('Company is inactive.'))
    }
    const token = company.generateCompanyToken(company._id)

    res.send({
        status: 'success',
        data: {
            token
        }
    })
})

exports.getCompanyDetails = catchAsync(async (req, res, next) => {
    // const { parentHost } = req.query
    const { id } = req.params
    logger.writeLog("companyController")
        .info(`${__filename}: getCompanyDetails() :: companyId=${id}`)
    const company = await Company.findById(id)

    if (!company) {
        return next(new AppError('Something went wrong'), 404)
    }

    res.send({
        status: 'success',
        data: {
            company
        }
    })

})

const sendWebHookOnNewMsg = async (msg) => {
    try {
        const company = await Company.findById(msg.companyId)

        // For post webhook
        if (company?.onNewMsgWegHookPost && company.onNewMsgWegHookPostToken) {
            const decToken = `Bearer ${getDecryption(company.onNewMsgWegHookPostToken)}`
            logger.writeLog("companyController")
                .info(`${__filename}: sendWebHookOnNew() :: companyId=${company._id} onNewMsgWegHookPost=${company.onNewMsgWegHookPost}`)
            await axios.post(company.onNewMsgWegHookPost, msg, {
                headers: {
                    Authorization: decToken,
                    'Content-Type': 'application/json',
                },
            })
        }
    }
    catch (e) {
        if (e.response.data) {
            logger.writeLog("companyController")
                .error(`${__filename}: sendWebHookOnNew() :: companyId=${msg.companyId} axios error = ${JSON.stringify(e.response.data)}`)
        }
        else {
            logger.writeLog("companyController")
                .error(`${__filename}: sendWebHookOnNew() :: companyId=${msg.companyId} error = ${e}`)
        }
    }
}
exports.sendWebHookOnNewMsg = sendWebHookOnNewMsg