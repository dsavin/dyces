"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userWallet_1 = require("../../models/userWallet");
const walletTransaction_1 = require("../../models/walletTransaction");
const walletTransactionUtils_1 = require("../misc/walletTransactionUtils");
const socketManager_1 = require("../../libs/websocket/socketManager");
const response_1 = require("../misc/response");
exports.getWallet = async (uid) => {
    await ensureHasWallet(uid);
    const wallet = await userWallet_1.UserWallet.findOne({ uid }).lean().exec();
    const walletTransactions = (await walletTransactionUtils_1.getWalletTransactions(uid, wallet._id)).walletTransactions;
    return { wallet, walletTransactions };
};
exports.fundUserWallet = async (uid, amount) => {
    const userWallet = await userWallet_1.UserWallet.findOneAndUpdate({ uid }, { $inc: { balance: amount } }, {
        upsert: true,
        new: true
    }).exec();
    await walletTransactionUtils_1.addWalletTransaction(uid, userWallet._id, amount, walletTransaction_1.WalletTransactionType.FUNDING, walletTransaction_1.WalletEntryType.CREDIT);
    socketManager_1.sendEvent(uid, new socketManager_1.EventModel().createFromEvent(socketManager_1.EventType.OUT_EVENT_WALLET_FUNDED, {}, new socketManager_1.SocketNotification('Wallet funded')));
    return await exports.getWallet(uid);
};
exports.chargeWallet = async (uid, amount, transactionType) => {
    const wallet = await ensureHasWallet(uid);
    if (amount > wallet.balance)
        throw response_1.createError('Insufficient amount in wallet. Please fund wallet', 400);
    const userWallet = await userWallet_1.UserWallet.findOneAndUpdate({ uid }, { $inc: { balance: -amount } }, {
        upsert: true,
        new: true
    }).exec();
    await walletTransactionUtils_1.addWalletTransaction(uid, userWallet._id, amount, transactionType, walletTransaction_1.WalletEntryType.DEBIT);
    socketManager_1.sendEvent(uid, new socketManager_1.EventModel().createFromEvent(socketManager_1.EventType.OUT_EVENT_WALLET_CHARGED, {}, new socketManager_1.SocketNotification('Wallet charged')));
    return await exports.getWallet(uid);
};
const ensureHasWallet = async (uid) => {
    const wallet = await userWallet_1.UserWallet.findOne({ uid }).exec();
    if (wallet)
        return wallet;
    return await userWallet_1.UserWallet.findOneAndUpdate({ uid }, { balance: 0 }, { upsert: true, new: true }).exec();
};
//# sourceMappingURL=walletUtils.js.map