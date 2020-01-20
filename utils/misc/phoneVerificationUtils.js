"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const phoneVerification_1 = require("../../models/phoneVerification");
const moment_1 = __importDefault(require("moment"));
const response_1 = require("./response");
const voucher_code_generator_1 = __importDefault(require("voucher-code-generator"));
const smsUtils_1 = require("./smsUtils");
exports.requestPhoneVerification = async (phone, type) => {
    const code = voucher_code_generator_1.default.generate({ charset: '0123456789', length: 4, count: 1 })[0];
    // @ts-ignore
    const expiresIn = moment_1.default().add(5, 'min');
    const phoneVerification = await phoneVerification_1.PhoneVerification.findOneAndUpdate({ phone: phone, type: type }, { code: code, used: false, expiresIn: expiresIn }, { upsert: true, new: true }).lean().exec();
    await smsUtils_1.sendPhoneVerificationSMS(phoneVerification.phone, phoneVerification.code);
    return phoneVerification;
};
exports.verifyPhoneVerification = async (phone, code, type) => {
    const phoneVerification = await phoneVerification_1.PhoneVerification.findOne({ phone: phone, type: type }).lean().exec();
    if (!phoneVerification)
        throw response_1.createError('Verification not requested', 400);
    if (phoneVerification.used)
        throw response_1.createError('Verification expired', 400);
    if (phoneVerification.code !== Number(code))
        throw response_1.createError('This code is incorrect', 400);
    const currentMoment = moment_1.default();
    const phoneVerificationMoment = moment_1.default(phoneVerification.expiresIn);
    if (phoneVerificationMoment.isAfter(currentMoment))
        throw response_1.createError('Verification expired', 400);
    return phoneVerification;
};
exports.usePhoneVerification = async (code, type) => {
    const phoneVerification = await phoneVerification_1.PhoneVerification.findOne({ code: code, type: type }).exec();
    if (!phoneVerification)
        throw response_1.createError('Verification not requested', 400);
    if (phoneVerification.used)
        throw response_1.createError('Verification expired', 400);
    const currentMoment = moment_1.default();
    const phoneVerificationMoment = moment_1.default(phoneVerification.expiresIn);
    if (phoneVerificationMoment.isAfter(currentMoment))
        throw response_1.createError('Verification expired', 400);
    await phoneVerification.update({ used: true });
    return phoneVerification;
};
//# sourceMappingURL=phoneVerificationUtils.js.map