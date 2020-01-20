import {Schema, Document, Model, model} from "mongoose";
import {BaseModel} from "./baseModel";

export enum AuthTokenType {
    ADMIN = 'admin',
    USER = 'user'
}

export interface IAuthToken extends BaseModel {
    uid: string;
    token: string;
    type: AuthTokenType;
}

const fcmTokenSchema = new Schema({
    uid: {type: Schema.Types.ObjectId, required: true},
    token: {type: String, required: true},
    type: {type: AuthTokenType, required: true}
}, {timestamps: true});

export const AuthToken: Model<IAuthToken> = model<IAuthToken>('authToken', fcmTokenSchema);