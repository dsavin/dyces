import {createError} from "../../../utils/misc/response";
import {verifyToken} from "../../../utils/misc/authTokenUtils";
import {AuthTokenType} from "../../../models/authToken";

module.exports = async (req, res, next) => {
    const token = req.headers['x-access-token'] || req.headers.authorization;
    if (!token) return next(createError("Authorization field missing", 401));
    const uid = await verifyToken(token, AuthTokenType.USER);
    if (!uid) return next(createError("Authorization failed", 401));
    const url = req.protocol + '://' + req.get('host') + req.originalUrl;
    req.query.uid = uid;
    // console.log(`User: ${uid}, accessing: ${url}`);
    next();
};