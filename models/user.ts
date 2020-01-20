import {BaseModel} from "./baseModel";
import {model, Model, Schema} from "mongoose";

export interface IUser extends BaseModel {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password?: string;
    token?: string;
    salt?: string;
}

const userSchema = new Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    phone: {type: String, required: true},
    email: {type: String, required: true}
});

export const User: Model<IUser> = model<IUser>('user', userSchema);