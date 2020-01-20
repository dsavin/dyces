import {model, Model, Schema} from "mongoose";
import {IWallet} from "./interfaces/wallet";

const userWalletSchema = new Schema({
    uid: {type: Schema.Types.ObjectId, ref: 'user', required: true},
    balance: {type: Number, default: 0}
}, {timestamps: true});

export const UserWallet: Model<IWallet> = model<IWallet>('userWallet', userWalletSchema);