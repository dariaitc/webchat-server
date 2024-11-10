
const catchAsync = require('../util/catchAsync')
const AppError = require('../util/AppError')
const logger = require("../util/logger");
const { checkToken } = require("../util/jwtManagement");
const User = require('../models/userModel')

exports.localhostOnly = (req, res, next) => {
    logger.writeLog("utilContoller").info(`${__filename}: localhostOnly() :: IP=${req.headers["x-forwarded-for"] || req.socket.remoteAddress} Path=${req.originalUrl}`)
    const allowedHosts = ['::1', '127.0.0.1', 'localhost']; // IPV6 localhost, IPV4 localhost, and 'localhost' name
    // Check if the request IP is from localhost
    // if (allowedHosts.includes(req.hostname) || allowedHosts.includes(req.ip)) {
    if (allowedHosts.includes(req.headers["x-forwarded-for"]) || allowedHosts.includes(req.socket.remoteAddress)) {
        return next(); // Request is from localhost, proceed
    }
    return next(new AppError('Access forbidden: This endpoint is restricted'))
}