const Cryptr = require('cryptr')
const crypto = require('crypto');

const crypKey = process.env.CRYP_KEY//require('../settings').crypKey
const cryptr = new Cryptr(crypKey)
const addStr = 'Effective2021!@'

const getEncryption = (toEnctypt) => {
    return cryptr.encrypt(toEnctypt + addStr)
}
const getDecryption = (toDecrypt) => {
    return cryptr.decrypt(toDecrypt).replace(addStr, '')
}

// Function to hash the token using SHA-256
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = { getEncryption, getDecryption, hashToken }