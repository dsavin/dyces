import {Schema, Document, Model, model} from "mongoose";
import {generate} from "voucher-code-generator";

export enum PhoneVerificationReason {
    MERCHANT_SIGN_UP = 'merchant_sign_up',
    USER_SIGN_UP = 'user_sign_up',
    USER_PASSWORD_RESET = 'user_password_reset'
}

export interface IPhoneVerification extends Document {
    phone: string;
    code: number;
    type: PhoneVerificationReason;
    expiresIn: Date;
    used?: boolean;
}

export const getSupportedVerificationReasons = (): PhoneVerificationReason[] => {
    return Object.values(PhoneVerificationReason);
};
const phoneVerificationSchema = new Schema({
    phone: {type: String, required: true},
    code: {type: Number, required: true},
    type: {type: String, required: true},
    expiresIn: {type: Date, required: true},
    used: {type: Boolean, default: false},
}, {timestamps: true});

export const PhoneVerification: Model<IPhoneVerification> = model<IPhoneVerification>('phoneVerification', phoneVerificationSchema);