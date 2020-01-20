"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
var WalletTransactionType;
(function (WalletTransactionType) {
    WalletTransactionType["FUNDING"] = "Funding";
    WalletTransactionType["WITHDRAWAL"] = "Withdrawal";
    WalletTransactionType["WITHDRAWAL_FEE"] = "Withdrawal Fee";
    WalletTransactionType["REVERSAL"] = "Reversal";
})(WalletTransactionType = exports.WalletTransactionType || (exports.WalletTransactionType = {}));
var WalletEntryType;
(function (WalletEntryType) {
    WalletEntryType["DEBIT"] = "Debit";
    WalletEntryType["CREDIT"] = "Credit";
})(WalletEntryType = exports.WalletEntryType || (exports.WalletEntryType = {}));
const walletTransactionSchema = new mongoose_1.Schema({
    uid: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    walletId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true },
    transactionType: { type: String, required: true },
    entryType: { type: String, required: true }
}, { timestamps: true });
exports.WalletTransaction = mongoose_1.model('walletTransaction', walletTransactionSchema);
//# sourceMappingURL=walletTransaction.js.map