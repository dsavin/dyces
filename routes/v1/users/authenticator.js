"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../../../utils/misc/response");
const authTokenUtils_1 = require("../../../utils/misc/authTokenUtils");
const authToken_1 = require("../../../models/authToken");
module.exports = async (req, res, next) => {
    const token = req.headers['x-access-token'] || req.headers.authorization;
    if (!token)
        return next(response_1.createError("Authorization field missing", 401));
    const uid = await authTokenUtils_1.verifyToken(token, authToken_1.AuthTokenType.USER);
    if (!uid)
        return next(response_1.createError("Authorization failed", 401));
    const url = req.protocol + '://' + req.get('host') + req.originalUrl;
    req.query.uid = uid;
    // console.log(`User: ${uid}, accessing: ${url}`);
    next();
};
//# sourceMappingURL=authenticator.js.map