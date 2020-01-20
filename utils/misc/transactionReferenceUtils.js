"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("./response");
const transactionReference_1 = require("../../models/transactionReference");
const voucher_code_generator_1 = require("voucher-code-generator");
exports.addTransactionReference = async (uid, amount, itemId, reason, saveCard) => {
    // noinspection SpellCheckingInspection
    const transactionReference = await transactionReference_1.TransactionReference.findOneAndUpdate({ uid: uid, itemId: itemId, reason: reason }, {
        amount: amount,
        itemId: itemId,
        saveCard: saveCard,
        used: false,
        reference: voucher_code_generator_1.generate({ prefix: 'REF-', pattern: '####-####-####', charset: '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ' })[0]
    }, { new: true, upsert: true }).exec();
    return await exports.getTransactionReference(transactionReference.reference);
};
exports.getTransactionReference = async (reference, markUsed = false) => {
    const update = markUsed ? { used: true } : {};
    const transactionReference = await transactionReference_1.TransactionReference.findOneAndUpdate({ reference: reference }, update).exec();
    if (!transactionReference)
        throw response_1.createError('Transaction reference not found', 404);
    return { transactionReference: transactionReference };
};
exports.markReferenceUsed = async (reference) => {
    await transactionReference_1.TransactionReference.findOneAndUpdate({ reference: reference }, { used: true }).exec();
    return { message: 'updated' };
};
//# sourceMappingURL=transactionReferenceUtils.js.map