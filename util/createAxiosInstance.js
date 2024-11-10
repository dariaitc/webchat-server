const axios = require('axios');

//auth={type:[basic,OAuthV2]}
const createAxiosInstance = (baseURL, auth, headers = {}) => {
    if (!auth?.type) throw new Error('Cant make oreka instance without auth details');
    let optionalAuth = undefined;
    if (auth.type === 'OAuthV2') {
        if(!auth.token){
            throw new Error(`auth.token missed`);
        }
        headers['Authorization'] = auth.token
    }
    else if (auth.type === 'basic') {
        if(!auth.username || !auth.password){
            throw new Error(`auth.username or auth.password missed`);
        }
        optionalAuth = {
            username: auth.username,
            password: auth.password
        }
    }
    else {
        throw new Error(`auth.type param was not type of [OAuthV2,basic]`);
    }

    return axios.create({
        baseURL: baseURL,
        auth: optionalAuth,
        headers: headers
    });
}

module.exports = createAxiosInstance
