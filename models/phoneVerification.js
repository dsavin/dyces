"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
var PhoneVerificationReason;
(function (PhoneVerificationReason) {
    PhoneVerificationReason["MERCHANT_SIGN_UP"] = "merchant_sign_up";
    PhoneVerificationReason["USER_SIGN_UP"] = "user_sign_up";
    PhoneVerificationReason["USER_PASSWORD_RESET"] = "user_password_reset";
})(PhoneVerificationReason = exports.PhoneVerificationReason || (exports.PhoneVerificationReason = {}));
exports.getSupportedVerificationReasons = () => {
    return Object.values(PhoneVerificationReason);
};
const phoneVerificationSchema = new mongoose_1.Schema({
    phone: { type: String, required: true },
    code: { type: Number, required: true },
    type: { type: String, required: true },
    expiresIn: { type: Date, required: true },
    used: { type: Boolean, default: false },
}, { timestamps: true });
exports.PhoneVerification = mongoose_1.model('phoneVerification', phoneVerificationSchema);
//# sourceMappingURL=phoneVerification.js.map