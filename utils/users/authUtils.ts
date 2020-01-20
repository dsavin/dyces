import {IUser, User} from "../../models/user";
import {createError} from "../misc/response";
import {compareHash, saltHashPassword} from "../misc/hashUtils";
import jwt from 'jsonwebtoken';
import {PhoneVerificationReason, getSupportedVerificationReasons} from "../../models/phoneVerification";
import {requestPhoneVerification, usePhoneVerification, verifyPhoneVerification} from "../misc/phoneVerificationUtils";
const jwtSecret = process.env.JWT_SECRET;

export const checkPhone = async (body: {reason: PhoneVerificationReason, phone: string,
    forceSendToken: boolean, requiresAuthenticatedUser: boolean}) => {
    if (!(body as any).reason) throw createError('Reason is required', 400);
    if (!body.phone) throw createError('Phone number is required', 400);
    const supportedVerificationReasons = getSupportedVerificationReasons();
    console.log('Checking account: ', body.phone);
    if (!supportedVerificationReasons.includes(body.reason)) throw createError(`Reason ${body.reason} not supported`, 400);
    const user: IUser = await User.findOne({phone: body.phone}).lean().exec();
    if (!user) {
        if (body.requiresAuthenticatedUser) throw createError('Account not found', 400);
        await requestPhoneVerification(body.phone, body.reason);
        return {phone: body.phone, requestVerification: true, firstName: null};
    }
    if (body.forceSendToken) await requestPhoneVerification(body.phone, body.reason);
    return {phone: user.phone, requestVerification: true, firstName: user.firstName};
};

export const verifyPhone = async (body: {reason: PhoneVerificationReason, phone: string, code: string}) => {
    if (!(body as any).reason) throw createError('Reason is required', 400);
    if (!body.phone) throw createError('Phone number required', 400);
    if (!body.code) throw createError('Verification code is required', 400);
    const phoneVerification = await verifyPhoneVerification(body.phone, body.code, body.reason);
    return {
        phone: body.phone,
        code: phoneVerification.code
    };
};

export const login = async (body: IUser) => {
    if (!body.phone) throw createError('Phone number is required', 400);
    if (!body.password) throw createError('Password is required', 400);
    const user = await User.findOne({phone: body.phone}).lean().exec();
    if (!compareHash(user.password, user.salt, body.password))
        throw createError('Incorrect password', 400);
    return await getUserObject(user._id);
};

export const register = async (body: IUser) => {
    if (!body.firstName) throw createError('First name is required', 400);
    if (!body.lastName) throw createError('Last name is required', 400);
    if (!body.email) throw createError('Email is required', 400);
    if (!(body as any).verificationCode) throw createError('Verification code is required', 400);
    if (!body.password) throw createError('Password is required', 400);
    if (await doesEmailExist(body.email)) throw createError('Email address already in use', 400);
    const phoneVerification = await usePhoneVerification((body as any).verificationCode, PhoneVerificationReason.USER_SIGN_UP);
    body.phone = phoneVerification.phone;
    body.token = jwt.sign({phone: body.phone}, jwtSecret, {expiresIn: '1yr'});
    const encodedPassword = saltHashPassword(body.password);
    body.password = encodedPassword.password;
    body.salt = encodedPassword.salt;
    let user = new User(body);
    user = await user.save();
    return await getUserObject(user._id);
};

export const resetPassword = async (body: {verificationCode: string, password: string}) => {
    if (!body.verificationCode) throw createError('Verification code is required', 400);
    if (!body.password) throw createError('Password is required', 400);
    const phoneVerification = await usePhoneVerification(body.verificationCode, PhoneVerificationReason.USER_PASSWORD_RESET);
    const user = await User.findOne({phone: phoneVerification.phone});
    if (!user) throw createError('Account not found', 400);
    const encodedPassword = saltHashPassword(body.password);
    const password = encodedPassword.password;
    const salt = encodedPassword.salt;
    const token = jwt.sign({phone: user.phone}, jwtSecret, {expiresIn: '1yr'});
    await User.findByIdAndUpdate(user._id, {
        password: password,
        salt: salt,
        token: token
    }).exec();
    return await getUserObject(user._id);
};

const getUserById = async (uid) => {
    const user = await User.findById(uid).exec();
    if (!user) throw createError('User not found', 400);
    return user;
};

const getUserObject = async (uid) => {
    return {user: await getUserById(uid)};
};

const doesEmailExist = async (email) => {
    const count = await User.countDocuments({email: email}).exec();
    return count > 0;
};
