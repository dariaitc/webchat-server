const logger = require("../util/logger");

const logAsyncError = (
  func,
  logPath,
  optional = { logName: null, throwNext: false }
) => {
  return (...args) =>
    func(...args).catch((err) => {
      if (err?.response?.data) {
        Error_Log.error(
          `${logPath} :: Response Error=${JSON.stringify(err.response.data)}`
        );
        optional.logName &&
          logger
            .writeLog(optional.logName)
            .info(`${logPath} :: Error=${JSON.stringify(err.response.data)}`);
      } else {
        logger
          .writeLog("error")
          .error(
            `${logPath} :: process.on('uncaughtException',event) :: Error=${err}`
          );
        optional.logName &&
          logger.writeLog(optional.logName).info(`${logPath} :: Error=${err}`);
      }
      if (optional.throwNext) throw err;
    });
};

module.exports = logAsyncError;
