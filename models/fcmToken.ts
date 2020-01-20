import {Schema, Document, Model, model} from "mongoose";

export interface IFcmToken extends Document {
    uid: string;
    token: string;
}

const fcmTokenSchema = new Schema({
    uid: {type: Schema.Types.ObjectId, required: true},
    token: {type: String, required: true}
}, {timestamps: true});

export const FcmToken: Model<IFcmToken> = model<IFcmToken>('fcmToken', fcmTokenSchema);