"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
var AuthTokenType;
(function (AuthTokenType) {
    AuthTokenType["ADMIN"] = "admin";
    AuthTokenType["USER"] = "user";
})(AuthTokenType = exports.AuthTokenType || (exports.AuthTokenType = {}));
const fcmTokenSchema = new mongoose_1.Schema({
    uid: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    token: { type: String, required: true },
    type: { type: AuthTokenType, required: true }
}, { timestamps: true });
exports.AuthToken = mongoose_1.model('authToken', fcmTokenSchema);
//# sourceMappingURL=authToken.js.map