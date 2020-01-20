import {Schema, Document, Model, model} from "mongoose";
import {IUser} from "./user";
import {ICard} from "./card";

export enum TransactionReason {
    USER_WALLET_FUNDING = 'user_wallet_funding',
    CARD_ADDING = 'card_adding'
}

export enum TransactionDescription {
    WALLET_WITHDRAWAL = 'Wallet Withdrawal'
}

export interface ITransactionReference extends Document {
    uid: IUser | string;
    reference: string;
    amount: number;
    reason: TransactionReason;
    itemId: Schema.Types.ObjectId;
    card: ICard;
    used: boolean;
    saveCard: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export const getTransactionReferenceReasons = (): string[] => {
    return Object.values(TransactionReason);
};

const transactionReferenceSchema = new Schema({
    uid: {type: Schema.Types.ObjectId, ref: 'user', required: true},
    reference: {type: String, required: true},
    amount: {type: Number, required: true},
    reason: {type: String, required: true},
    itemId: {type: Schema.Types.ObjectId, required: true},
    card: {
        _id: {type: Schema.Types.ObjectId, ref: 'card'},
        uid: {type: Schema.Types.ObjectId, required: false, ref: 'users'},
        number: {type: String, required: false},
        expMonth: {type: String, required: false},
        expYear: {type: String, required: false},
        required: false,
    },
    used: {type: Boolean, default: false},
    saveCard: {type: Boolean, default: false},
    createdAt: Date,
    updatedAt: Date
}, {timestamps: true});

export const TransactionReference: Model<ITransactionReference> = model<ITransactionReference>('transactionReference', transactionReferenceSchema);
