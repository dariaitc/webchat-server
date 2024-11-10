//Core modules
/////////////////////
const jwt = require("jsonwebtoken");
const path = require("path");
const { getDecryption, getEncryption } = require("../util/crypt");
const logAsyncError = require("../util/logAsyncError");

//application modules
/////////////////////
const { asyncWriteFile, asyncReadFile } = require("../util/asyncFileSystem");

exports.createToken = logAsyncError(
  async (payload) => {
    const newJwt = jwt.sign(payload, process.env.JWT_SECRET);
    const objToWrite = {
      encToken: getEncryption(newJwt),
    };
    await asyncWriteFile(
      path.join("./", `token.json`),
      JSON.stringify(objToWrite)
    );

    return newJwt;
  },
  "./util/jwtManagement.js :: createToken() ::",
  { logName: "jwtManagement", throwNext: true }
);

exports.checkToken = logAsyncError(
  async (token) => {
    const currentTokenObj = JSON.parse(
      await asyncReadFile(path.join("./", `token.json`), "utf-8")
    );
    const decToken = getDecryption(currentTokenObj.encToken);

    if (decToken !== token) {
      throw new Error("invalid token");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload._id !== process.env.JWT_ID) {
      throw new Error("invalid token");
    }

    return true;
  },
  "./util/jwtManagement.js :: checkToken() ::",
  { logName: "jwtManagement", throwNext: true }
);
