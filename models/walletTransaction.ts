
import {Document, model, Model, Schema} from "mongoose";

export enum WalletTransactionType {
    FUNDING = "Funding",
    WITHDRAWAL = "Withdrawal",
    WITHDRAWAL_FEE = "Withdrawal Fee",
    REVERSAL = "Reversal"
}

export enum WalletEntryType {
    DEBIT = "Debit",
    CREDIT = "Credit"
}
export interface IWalletTransaction extends Document {
    uid: string;
    walletId: string;
    amount: number;
    transactionType: WalletTransactionType;
    entryType: WalletEntryType;
}

const walletTransactionSchema = new Schema({
    uid: {type: Schema.Types.ObjectId, required: true},
    walletId: {type: Schema.Types.ObjectId, required: true},
    amount: {type: Number, required: true},
    transactionType: {type: String, required: true},
    entryType: {type: String, required: true}
}, {timestamps: true});

export const WalletTransaction: Model<IWalletTransaction> = model<IWalletTransaction>('walletTransaction', walletTransactionSchema);