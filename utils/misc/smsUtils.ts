
import util from 'util';
const twilio = require('twilio')(process.env.SMS_KEY, process.env.SMS_SECRET);
export const sendPhoneVerificationSMS = async (phone, code) => {
    const message = `Use code ${code} to verify your phone number on Dyces. This code is valid for 30 minutes`;
    await sendSms(phone, message);
};

export const sendPasswordResetSms = async (phone, code) => {
    const message = `Use code ${code} to reset your password on Dyces. This code is valid for 30 minutes`;
    console.log('Sending verification sms to: ' + phone);
    await sendSms(phone, message);
};

export const sendSms = async (phone, message) => {
    const result = await twilio.messages.create(({
        // from: '+12022174842',
        from: 'Dyces',
        to: phone,
        body: message
    }));
    console.log('Sms result: ', util.inspect(result, false, null, true));
};