
const jwt = require('jsonwebtoken')
const catchAsync = require('../util/catchAsync')
const AppError = require('../util/AppError')
const logger = require("../util/logger");
const { checkToken } = require("../util/jwtManagement");
const User = require('../models/userModel')
const Company = require('../models/companyModel')
const { hashToken } = require('../util/crypt')

const getUserDataFromUserIdentifierId = async (userIdentifierId) => {
    if (!userIdentifierId) {
        logger.writeLog("authController")
            .error(`${__filename}: getUserDataFromUserIdentifierId() :: Missing body param userIdentifierId`)
        throw new Error('Please Login again')
    }

    const splittedUserIdentifierId = userIdentifierId.split('-')
    if (splittedUserIdentifierId.length !== 4) {
        logger.writeLog("authController")
            .error(`${__filename}: getUserDataFromUserIdentifierId() :: userIdentifierId length not equals 4`)
        throw new Error('Please Login again')
    }

    const [appName, _, companyId, crosWebUserId] = splittedUserIdentifierId
    if (!appName || !companyId || !crosWebUserId) {
        logger.writeLog("authController")
            .error(`${__filename}: getUserDataFromUserIdentifierId() :: Something missing appName=${appName} companyId=${companyId} crosWebUserId=${crosWebUserId}`)
        throw new Error('Please Login again')
    }

    const company = await Company.findById(companyId)
    if (!company) {
        logger.writeLog("authController")
            .error(`${__filename}: getUserDataFromUserIdentifierId() :: Company not found`)
        throw new Error('Please Login again')
    }

    return {
        company,
        companyId,
        crosWebUserId,
        userIdentifierId
    }
}

exports.isCompanyBearerTokenValid = catchAsync(async (req, res, next) => {
    let token
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_COMPANY)
    const { companyId } = decoded

    const company = await Company.findById(companyId)
    if(!company?.isActive){
        return next(new AppError('Company is inactive.'))
    }
    req.company = company
    next()
})

const getUserBearerToken = async (cookies, userIdentifierId) => {
    let tokenDec = cookies[userIdentifierId]
    tokenDec = tokenDec?.replace('Bearer ', '')
    if (!tokenDec) {
        logger.writeLog("authController")
            .error(`${__filename}: getUserBearerToken() :: Missing param tokenDec`)
        throw new Error('User not found.')
    }

    const decoded = jwt.verify(tokenDec, process.env.JWT_SECRET)

    const searchUserObj = {
        companyId: decoded.companyId,
        _id: decoded.userId,
        userIdentifierId,
        hashToken: hashToken(tokenDec)
    }
    const user = await User.findOne(searchUserObj)

    if (!user || !user.isTokenValideNow(decoded.iat)) {
        logger.writeLog("authController")
            .error(`${__filename}: getUserBearerToken() :: User not found or token invalid`)
        throw new Error('User not found.')
    }

    const company = await Company.findById(user.companyId).select('+isActive')
    if (!company || !company.isActive) {
        logger.writeLog("authController")
            .error(`${__filename}: getUserBearerToken() :: company not found or not active`)
        throw new Error('User not found.')
    }

    return {
        company,
        user
    }
}
exports.getUserBearerToken = getUserBearerToken

// When theire is no bearer token or invalid bearer token
exports.userLogin = catchAsync(async (req, res, next) => {
    const { userIdentifierId } = req.body
    let user, company
    if (!userIdentifierId) {
        logger.writeLog("authController")
            .error(`${__filename}: userLogin() :: Missing body param userIdentifierId`)
        return next(new AppError('Please Login again', 400))
    }

    try {
        ({ user, company } = await getUserBearerToken(req.cookies, userIdentifierId))
        return res.status(200).send({
            status: 'success',
            data: {
                company,
                user
            }
        })
    } catch (e) {
        logger.writeLog("authController")
            .info(`${__filename}: userLogin() :: userIdentifierId=${userIdentifierId} not found create new`)
    }

    const userDate = await getUserDataFromUserIdentifierId(userIdentifierId)

    req.company = userDate.company
    req.createUser = {
        companyId: userDate.companyId,
        crosWebUserId: userDate.crosWebUserId,
        userIdentifierId
    }

    next();
})

exports.createCookiesWithBearerToken = catchAsync(async (req, res, next) => {
    const { createUser } = req
    const { company } = req
    const user = new User(createUser)
    await user.save({ validateBeforeSave: false });

    if (!user) {
        logger.writeLog("authController")
            .error(`${__filename}: createCookiesWithBearerToken() :: Couldn't create user`)
        return next(new AppError('Please Login again'))
    }

    const { token, crosWebUserId, companyId, userIdentifierId } = user
    if (!token || !crosWebUserId || !companyId) {
        logger.writeLog("authController")
            .error(`${__filename}: createCookiesWithBearerToken() :: Couldn't create user token`)
        return next(new AppError('Please Login again'))
    }

    const tokenExpiresIn = process.env.JWT_COOKIE_EXPIRES_IN * 60 * 1000
    res.cookie(userIdentifierId, token, {
        expires: new Date(Date.now() + tokenExpiresIn),
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    })

    const userDoc = { ...user._doc }
    userDoc.decToken = userDoc.token

    delete userDoc.hashToken
    delete userDoc.tokenValidFrom
    delete userDoc.tokenValidUntil
    delete userDoc.createdAt
    delete userDoc.updatedAt
    delete userDoc.__v


    res.status(201).send({
        status: 'success',
        data: {
            company,
            user: userDoc
        }
    })

})


exports.isBearerTokenValid = catchAsync(async (req, res, next) => {
    const { userIdentifierId } = req.params
    try {
        const { user, company } = await getUserBearerToken(req.cookies, userIdentifierId)
        req.user = user
        req.company = company
        next()
    } catch (e) {
        return next(AppError('Please login.', 403))
    }
})

exports.useLoggedUserIdsOnQuery = catchAsync(async (req, res, next) => {
    const { user: { companyId, _id: userId } } = req
    logger.writeLog("authController").info(`${__filename}: useLoggedUserIdsOnReqBody() :: companyId=${companyId} userId=${userId}`)
    if (!companyId || !userId) return next(new AppError('Something went wrong, please contact system administrator.'))
    req.query = { ...req.query, companyId, userId }
    next()
})