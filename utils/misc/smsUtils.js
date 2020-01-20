"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const twilio = require('twilio')(process.env.SMS_KEY, process.env.SMS_SECRET);
exports.sendPhoneVerificationSMS = async (phone, code) => {
    const message = `Use code ${code} to verify your phone number on Dyces. This code is valid for 30 minutes`;
    await exports.sendSms(phone, message);
};
exports.sendPasswordResetSms = async (phone, code) => {
    const message = `Use code ${code} to reset your password on Dyces. This code is valid for 30 minutes`;
    console.log('Sending verification sms to: ' + phone);
    await exports.sendSms(phone, message);
};
exports.sendSms = async (phone, message) => {
    const result = await twilio.messages.create(({
        // from: '+12022174842',
        from: 'Dyces',
        to: phone,
        body: message
    }));
    console.log('Sms result: ', util_1.default.inspect(result, false, null, true));
};
//# sourceMappingURL=smsUtils.js.map