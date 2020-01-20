"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const walletTransaction_1 = require("../../models/walletTransaction");
exports.addWalletTransaction = async (uid, walletId, amount, transactionType, entryType) => {
    const walletTransaction = await (new walletTransaction_1.WalletTransaction({
        uid, walletId, amount, transactionType, entryType
    })).save();
    return { walletTransaction };
};
exports.getWalletTransactions = async (uid, walletId) => {
    const walletTransactions = await walletTransaction_1.WalletTransaction.find({ uid, walletId })
        .sort({ createdAt: 'desc' }).lean().exec();
    return { walletTransactions };
};
//# sourceMappingURL=walletTransactionUtils.js.map