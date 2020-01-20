"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const fcmTokenSchema = new mongoose_1.Schema({
    uid: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    token: { type: String, required: true }
}, { timestamps: true });
exports.FcmToken = mongoose_1.model('fcmToken', fcmTokenSchema);
//# sourceMappingURL=fcmToken.js.map