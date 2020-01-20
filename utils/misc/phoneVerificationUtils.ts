import {IPhoneVerification, PhoneVerificationReason, PhoneVerification} from "../../models/phoneVerification";
import moment from 'moment';
import {createError} from "./response";
import voucherCodeGenerator from "voucher-code-generator";
import {sendPhoneVerificationSMS} from "./smsUtils";

export const requestPhoneVerification = async (phone: string, type: PhoneVerificationReason): Promise<IPhoneVerification> => {
    const code = voucherCodeGenerator.generate({charset: '0123456789', length: 4, count: 1})[0];
    // @ts-ignore
    const expiresIn = moment().add(5, 'min');
    const phoneVerification: IPhoneVerification = await PhoneVerification.findOneAndUpdate({phone: phone, type: type},
        {code: code, used: false, expiresIn: expiresIn}, {upsert: true, new: true}).lean().exec();
    await sendPhoneVerificationSMS(phoneVerification.phone, phoneVerification.code);
    return phoneVerification;
};

export const verifyPhoneVerification = async (phone: string, code: string, type: PhoneVerificationReason): Promise<IPhoneVerification> => {
    const phoneVerification: IPhoneVerification = await PhoneVerification.findOne({phone: phone, type: type}).lean().exec();
    if (!phoneVerification) throw createError('Verification not requested', 400);
    if (phoneVerification.used) throw createError('Verification expired', 400);
    if (phoneVerification.code !== Number(code)) throw createError('This code is incorrect', 400);
    const currentMoment = moment();
    const phoneVerificationMoment = moment(phoneVerification.expiresIn);
    if (phoneVerificationMoment.isAfter(currentMoment))
        throw createError('Verification expired', 400);
    return phoneVerification;
};

export const usePhoneVerification = async (code: string, type: PhoneVerificationReason): Promise<IPhoneVerification> => {
    const phoneVerification: IPhoneVerification = await PhoneVerification.findOne({code: code, type: type}).exec();
    if (!phoneVerification) throw createError('Verification not requested', 400);
    if (phoneVerification.used) throw createError('Verification expired', 400);
    const currentMoment = moment();
    const phoneVerificationMoment = moment(phoneVerification.expiresIn);
    if (phoneVerificationMoment.isAfter(currentMoment))
        throw createError('Verification expired', 400);
    await phoneVerification.update({used: true});
    return phoneVerification;
};