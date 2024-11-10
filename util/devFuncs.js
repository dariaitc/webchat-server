const { createToken, checkToken } = require("../util/jwtManagement");
const axios = require('axios');

if (process.argv[2] === "create-new-jwt") {
  const createNewJwtAsync = async () => {
    const newJwt = await createToken({ _id: process.env.JWT_ID });
    console.log(newJwt);
  };
  createNewJwtAsync();
  return;
}

if (process.argv[2] === "check-jwt") {
  const checkJwtAsync = async () => {
    try {
      const isValid = await checkToken(process.argv[3]);
      console.log(`isValid=true`);
    } catch (err) {
      console.log(`${err}`);
    }
  };
  checkJwtAsync();
  return;
}




