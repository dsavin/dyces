"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userWalletSchema = new mongoose_1.Schema({
    uid: { type: mongoose_1.Schema.Types.ObjectId, ref: 'user', required: true },
    balance: { type: Number, default: 0 }
}, { timestamps: true });
exports.UserWallet = mongoose_1.model('userWallet', userWalletSchema);
//# sourceMappingURL=userWallet.js.map