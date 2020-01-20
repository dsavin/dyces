"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fcmToken_1 = require("../../models/fcmToken");
exports.addFcmToken = async (uid, token) => {
    const fcmToken = await fcmToken_1.FcmToken.findOneAndUpdate({ uid: uid }, {
        token: token
    }, { upsert: true, new: true }).lean().exec();
    return { token: fcmToken.token };
};
exports.getFcmToken = async (uid) => {
    const fcmToken = await fcmToken_1.FcmToken.findOne({ uid: uid }).lean().exec();
    return fcmToken ? fcmToken.token : null;
};
//# sourceMappingURL=fcmTokenUtils.js.map