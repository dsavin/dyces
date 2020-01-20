"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by mcleroy on 12/15/2017.
 */
const mongoose_1 = require("mongoose");
const cardSchema = new mongoose_1.Schema({
    uid: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'users' },
    authorizationCode: { type: String, required: true },
    signature: { type: String, required: true },
    number: { type: String, required: true },
    bin: { type: String, required: true },
    last4: { type: String, required: true },
    expMonth: { type: String, required: true },
    expYear: { type: String, required: true },
    active: { type: Boolean, default: false },
    cardType: { type: String, required: true },
    brand: { type: String, required: true },
    bank: { type: String },
    reusable: { type: Boolean, required: true }
}, { timestamps: true });
cardSchema.pre('save', function (next) {
    const date = new Date();
    this.createdAt = date;
    this.updatedAt = date;
    next();
});
cardSchema.pre('findOneAndUpdate', function (next) {
    this.update({}, { $set: { createdAt: new Date() } });
    next();
});
exports.Card = mongoose_1.model('card', cardSchema);
//# sourceMappingURL=card.js.map