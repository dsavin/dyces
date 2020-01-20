import {IWallet} from "../../models/interfaces/wallet";
import {UserWallet} from "../../models/userWallet";
import {IWalletTransaction, WalletEntryType, WalletTransactionType} from "../../models/walletTransaction";
import {addWalletTransaction, getWalletTransactions} from "../misc/walletTransactionUtils";
import {EventModel, EventType, sendEvent, SocketNotification} from "../../libs/websocket/socketManager";
import {createError} from "../misc/response";

export const getWallet = async (uid: string): Promise<{wallet: IWallet, walletTransactions: IWalletTransaction[]}> => {
    await ensureHasWallet(uid);
    const wallet: IWallet = await UserWallet.findOne({uid}).lean().exec();
    const walletTransactions = (await getWalletTransactions(uid, wallet._id)).walletTransactions;
    return {wallet, walletTransactions};
};

export const fundUserWallet = async (uid: string, amount: number): Promise<{wallet: IWallet, walletTransactions: IWalletTransaction[]}> => {
    const userWallet: IWallet = await UserWallet.findOneAndUpdate({uid}, {$inc: {balance: amount}}, {
        upsert: true,
        new: true
    }).exec();
    await addWalletTransaction(uid, userWallet._id, amount, WalletTransactionType.FUNDING, WalletEntryType.CREDIT);
    sendEvent(uid, new EventModel().createFromEvent(EventType.OUT_EVENT_WALLET_FUNDED, {},
        new SocketNotification('Wallet funded')));
    return await getWallet(uid);
};

export const chargeWallet = async (uid: string, amount: number, transactionType: WalletTransactionType) => {
    const wallet: IWallet = await ensureHasWallet(uid);
    if (amount > wallet.balance) throw createError('Insufficient amount in wallet. Please fund wallet', 400);
    const userWallet: IWallet = await UserWallet.findOneAndUpdate({uid}, {$inc: {balance: -amount}}, {
        upsert: true,
        new: true
    }).exec();
    await addWalletTransaction(uid, userWallet._id, amount, transactionType, WalletEntryType.DEBIT);
    sendEvent(uid, new EventModel().createFromEvent(EventType.OUT_EVENT_WALLET_CHARGED, {},
        new SocketNotification('Wallet charged')));
    return await getWallet(uid);
};

const ensureHasWallet = async (uid: string): Promise<IWallet> => {
    const wallet: IWallet = await UserWallet.findOne({uid}).exec();
    if (wallet) return wallet;
    return await UserWallet.findOneAndUpdate({uid}, {balance: 0}, {upsert: true, new: true}).exec();
};