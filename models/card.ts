/**
 * Created by mcleroy on 12/15/2017.
 */
import {Schema, Document, Model, model} from "mongoose";
import {IUser} from "./user";

export interface ICard extends Document {
    uid: IUser;
    authorizationCode: string;
    signature: string;
    number: string;
    bin: string;
    last4: string;
    expMonth: string;
    expYear: string;
    active: boolean;
    cardType: string;
    brand: string;
    bank: string;
    reusable: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const cardSchema = new Schema({
    uid: {type: Schema.Types.ObjectId, required: true, ref: 'users'},
    authorizationCode: {type: String, required: true},
    signature: {type: String, required: true},
    number: {type: String, required: true},
    bin: {type: String, required: true},
    last4: {type: String, required: true},
    expMonth: {type: String, required: true},
    expYear: {type: String, required: true},
    active: {type: Boolean, default: false},
    cardType : {type: String, required: true},
    brand: {type: String, required: true},
    bank: {type: String},
    reusable: {type: Boolean, required: true}
}, {timestamps: true});

cardSchema.pre('save', function(this: any, next) {
    const date = new Date();
    this.createdAt = date;
    this.updatedAt = date;
    next();
});

cardSchema.pre('findOneAndUpdate', function(next) {
    this.update({}, {$set: {createdAt: new Date()}});
    next();
});

export const Card: Model<ICard> = model<ICard>('card', cardSchema);