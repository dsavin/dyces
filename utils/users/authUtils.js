"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../../models/user");
const response_1 = require("../misc/response");
const hashUtils_1 = require("../misc/hashUtils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const phoneVerification_1 = require("../../models/phoneVerification");
const phoneVerificationUtils_1 = require("../misc/phoneVerificationUtils");
const jwtSecret = process.env.JWT_SECRET;
exports.checkPhone = async (body) => {
    if (!body.reason)
        throw response_1.createError('Reason is required', 400);
    if (!body.phone)
        throw response_1.createError('Phone number is required', 400);
    const supportedVerificationReasons = phoneVerification_1.getSupportedVerificationReasons();
    console.log('Checking account: ', body.phone);
    if (!supportedVerificationReasons.includes(body.reason))
        throw response_1.createError(`Reason ${body.reason} not supported`, 400);
    const user = await user_1.User.findOne({ phone: body.phone }).lean().exec();
    if (!user) {
        if (body.requiresAuthenticatedUser)
            throw response_1.createError('Account not found', 400);
        await phoneVerificationUtils_1.requestPhoneVerification(body.phone, body.reason);
        return { phone: body.phone, requestVerification: true, firstName: null };
    }
    if (body.forceSendToken)
        await phoneVerificationUtils_1.requestPhoneVerification(body.phone, body.reason);
    return { phone: user.phone, requestVerification: true, firstName: user.firstName };
};
exports.verifyPhone = async (body) => {
    if (!body.reason)
        throw response_1.createError('Reason is required', 400);
    if (!body.phone)
        throw response_1.createError('Phone number required', 400);
    if (!body.code)
        throw response_1.createError('Verification code is required', 400);
    const phoneVerification = await phoneVerificationUtils_1.verifyPhoneVerification(body.phone, body.code, body.reason);
    return {
        phone: body.phone,
        code: phoneVerification.code
    };
};
exports.login = async (body) => {
    if (!body.phone)
        throw response_1.createError('Phone number is required', 400);
    if (!body.password)
        throw response_1.createError('Password is required', 400);
    const user = await user_1.User.findOne({ phone: body.phone }).lean().exec();
    if (!hashUtils_1.compareHash(user.password, user.salt, body.password))
        throw response_1.createError('Incorrect password', 400);
    return await getUserObject(user._id);
};
exports.register = async (body) => {
    if (!body.firstName)
        throw response_1.createError('First name is required', 400);
    if (!body.lastName)
        throw response_1.createError('Last name is required', 400);
    if (!body.email)
        throw response_1.createError('Email is required', 400);
    if (!body.verificationCode)
        throw response_1.createError('Verification code is required', 400);
    if (!body.password)
        throw response_1.createError('Password is required', 400);
    if (await doesEmailExist(body.email))
        throw response_1.createError('Email address already in use', 400);
    const phoneVerification = await phoneVerificationUtils_1.usePhoneVerification(body.verificationCode, phoneVerification_1.PhoneVerificationReason.USER_SIGN_UP);
    body.phone = phoneVerification.phone;
    body.token = jsonwebtoken_1.default.sign({ phone: body.phone }, jwtSecret, { expiresIn: '1yr' });
    const encodedPassword = hashUtils_1.saltHashPassword(body.password);
    body.password = encodedPassword.password;
    body.salt = encodedPassword.salt;
    let user = new user_1.User(body);
    user = await user.save();
    return await getUserObject(user._id);
};
exports.resetPassword = async (body) => {
    if (!body.verificationCode)
        throw response_1.createError('Verification code is required', 400);
    if (!body.password)
        throw response_1.createError('Password is required', 400);
    const phoneVerification = await phoneVerificationUtils_1.usePhoneVerification(body.verificationCode, phoneVerification_1.PhoneVerificationReason.USER_PASSWORD_RESET);
    const user = await user_1.User.findOne({ phone: phoneVerification.phone });
    if (!user)
        throw response_1.createError('Account not found', 400);
    const encodedPassword = hashUtils_1.saltHashPassword(body.password);
    const password = encodedPassword.password;
    const salt = encodedPassword.salt;
    const token = jsonwebtoken_1.default.sign({ phone: user.phone }, jwtSecret, { expiresIn: '1yr' });
    await user_1.User.findByIdAndUpdate(user._id, {
        password: password,
        salt: salt,
        token: token
    }).exec();
    return await getUserObject(user._id);
};
const getUserById = async (uid) => {
    const user = await user_1.User.findById(uid).exec();
    if (!user)
        throw response_1.createError('User not found', 400);
    return user;
};
const getUserObject = async (uid) => {
    return { user: await getUserById(uid) };
};
const doesEmailExist = async (email) => {
    const count = await user_1.User.countDocuments({ email: email }).exec();
    return count > 0;
};
//# sourceMappingURL=authUtils.js.map