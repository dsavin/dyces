import {BaseModel} from "./baseModel";
import {Model, model, Schema} from "mongoose";

export interface IPassword extends BaseModel {
    uid: string;
    password: string;
    salt: string;
}

const passwordSchema = new Schema({
    uid: {type: Schema.Types.ObjectId, required: true},
    password: {type: String, required: true},
    salt: {type: String, required: true}
}, {timestamps: true});

export const Password: Model<IPassword> = model<IPassword>('password', passwordSchema);