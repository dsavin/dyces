"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
var TransactionReason;
(function (TransactionReason) {
    TransactionReason["USER_WALLET_FUNDING"] = "user_wallet_funding";
    TransactionReason["CARD_ADDING"] = "card_adding";
})(TransactionReason = exports.TransactionReason || (exports.TransactionReason = {}));
var TransactionDescription;
(function (TransactionDescription) {
    TransactionDescription["WALLET_WITHDRAWAL"] = "Wallet Withdrawal";
})(TransactionDescription = exports.TransactionDescription || (exports.TransactionDescription = {}));
exports.getTransactionReferenceReasons = () => {
    return Object.values(TransactionReason);
};
const transactionReferenceSchema = new mongoose_1.Schema({
    uid: { type: mongoose_1.Schema.Types.ObjectId, ref: 'user', required: true },
    reference: { type: String, required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    itemId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    card: {
        _id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'card' },
        uid: { type: mongoose_1.Schema.Types.ObjectId, required: false, ref: 'users' },
        number: { type: String, required: false },
        expMonth: { type: String, required: false },
        expYear: { type: String, required: false },
        required: false,
    },
    used: { type: Boolean, default: false },
    saveCard: { type: Boolean, default: false },
    createdAt: Date,
    updatedAt: Date
}, { timestamps: true });
exports.TransactionReference = mongoose_1.model('transactionReference', transactionReferenceSchema);
//# sourceMappingURL=transactionReference.js.map