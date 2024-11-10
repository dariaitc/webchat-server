//Core modules
/////////////////////
// const fs = require('fs')
// const path = require('path')
//Npm modules
/////////////////////
const chalk = require('chalk');
require("dotenv").config({ path: "./config.env" });

//application modules
/////////////////////
const logger = require("./util/logger");
const connectToMongoDB = require('./lib/db/mongoDb/mongoDbConnection')
const { httpServer } = require("./app");
// const devFuncs = require("./util/devFuncs");

process.on("uncaughtException", (err) => {
  logger
    .writeLog("error")
    .error(
      `${__filename}: process.on('uncaughtException',event) :: ERR=${err}`
    );
});

process.on("unhandledRejection", (err) => {
  logger
    .writeLog("error")
    .error(
      `${__filename}: process.on('unhandledRejection',event) :: ERR=${err}`
    );
});

// Connect MongoDB
connectToMongoDB()

// Start the server
const port = process.env.APP_PORT || 5718;
httpServer.listen(port, () => {
  logger.writeLog("app").info(`Server is running at http://localhost:${port}`);
  console.log(
    chalk.bgRed.white('Server ') +
    chalk.bgRed.white(' is running on port ') +
    chalk.bgRed.cyan.bold(` ${port} `)
  )
  // console.log(`Server is running at http://localhost:${port}`);
});

