//Core modules
/////////////////////
const fs = require("fs");
const { promisify } = require("util");

exports.asyncIsDirExist = promisify(fs.exists);
exports.asyncMakedir = promisify(fs.mkdir);
exports.asyncWriteFile = promisify(fs.writeFile);
exports.asyncReadFile = promisify(fs.readFile);
