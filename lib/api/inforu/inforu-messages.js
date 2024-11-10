
const axios = require('axios')
const FormData = require('form-data');
const { parseString } = require('xml2js')
const logger = require("../../../util/logger");

exports.sendSmsInforu = async (smsUserName, token, from, to, text, msgId) => {
    logger.writeLog("inforu-messages").info('sendSmsInforu :: text=' + text + ', to=' + to + ', company=')
    let xmlBodySendSmsInforu =
        '<Inforu>' +
        '<User>' +
        '<Username>' + smsUserName + '</Username>' +
        '<ApiToken>' + token + '</ApiToken>' +
        '</User>' +
        "<Content Type=\"sms\">" +
        '<Message>' + text + '</Message>' +
        '</Content>' +
        '<Recipients>' +
        '<PhoneNumber>' + to + '</PhoneNumber>' +
        '</Recipients>' +
        '<Settings>' +
        '<Sender>' + from + '</Sender>' +
        `<DeliveryNotificationUrl>${process.env.SMS_MSG_SENT_EVENT_WEBHOOK_GET_URL.replace('{msgId}', msgId)}</DeliveryNotificationUrl>` +
        '</Settings>' +
        '</Inforu>'
    logger.writeLog("inforu-messages").info('sendSmsInforu :: reqXml=' + xmlBodySendSmsInforu)
    let bodyFormData = new FormData();
    bodyFormData.append('InforuXML', xmlBodySendSmsInforu);

    const inforuSmsRes = (
        await axios.request({
            method: 'post',
            url: 'https://api.inforu.co.il/SendMessageXml.ashx',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${bodyFormData._boundary}`,
            },
            data: bodyFormData
        })
    )
    let inforuSmsResData = inforuSmsRes.data
    logger.writeLog("inforu-messages").info('sendSmsInforu :: resXml=' + inforuSmsResData)
    inforuSmsResData = await new Promise((resolve, reject) => {
        parseString(inforuSmsResData, function (err, result) {
            if (!err) resolve(result)
            else reject(err)
        })
    })
    logger.writeLog("inforu-messages").info(`sendSmsInforu :: resJson=${JSON.stringify(inforuSmsResData)}`)
    return inforuSmsResData.Result
}