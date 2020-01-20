import {
    WalletEntryType,
    WalletTransactionType,
    IWalletTransaction,
    WalletTransaction
} from "../../models/walletTransaction";

export const addWalletTransaction = async (uid: string, walletId: string, amount: number,
                                           transactionType: WalletTransactionType, entryType: WalletEntryType)
    : Promise<{walletTransaction: IWalletTransaction}> => {
    const walletTransaction = await (new WalletTransaction({
        uid, walletId, amount, transactionType, entryType
    })).save();
    return {walletTransaction};
};

export const getWalletTransactions = async (uid: string, walletId): Promise<{walletTransactions: IWalletTransaction[]}> => {
    const walletTransactions: IWalletTransaction[] = await WalletTransaction.find({uid, walletId})
        .sort({createdAt: 'desc'}).lean().exec();
    return {walletTransactions};
};