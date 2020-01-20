
import {Document} from "mongoose";
import {IUser} from "../user";

export interface IWallet extends Document {
    uid: string | IUser
    balance: number;
}