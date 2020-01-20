"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authToken_1 = require("../../models/authToken");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtSecret = process.env.JWT_SECRET;
exports.addAuthToken = async (uid, email, type) => {
    const token = jsonwebtoken_1.default.sign({ phone: email }, jwtSecret, { expiresIn: '1yr' });
    const authToken = await authToken_1.AuthToken.findOneAndUpdate({ uid: uid, type: type }, {
        token: token
    }, { upsert: true, new: true }).lean().exec();
    return { token: authToken.token };
};
exports.getAuthToken = async (uid, type) => {
    const authToken = await authToken_1.AuthToken.findOne({ uid: uid, type: type }).lean().exec();
    return authToken ? authToken.token : null;
};
exports.verifyToken = async (token, type) => {
    token = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
    console.log('Token: ', token);
    const authToken = await authToken_1.AuthToken.findOne({ token: token, type: type }).lean().exec();
    if (!authToken)
        return null;
    try {
        jsonwebtoken_1.default.verify(token, jwtSecret);
    }
    catch (e) {
        return null;
    }
    return authToken.uid;
};
//# sourceMappingURL=authTokenUtils.js.map