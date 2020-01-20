import {createError} from "./response";
import {ITransactionReference, TransactionReason, TransactionReference} from "../../models/transactionReference";
import {generate} from "voucher-code-generator";

export const addTransactionReference = async (uid: string, amount: number, itemId: string, reason: TransactionReason, saveCard?: boolean): Promise<{transactionReference: ITransactionReference}> => {
    // noinspection SpellCheckingInspection
    const transactionReference = await TransactionReference.findOneAndUpdate({uid: uid, itemId: itemId, reason: reason}, {
        amount: amount,
        itemId: itemId,
        saveCard: saveCard,
        used: false,
        reference: generate({prefix: 'REF-', pattern: '####-####-####', charset: '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ'})[0]
    }, {new: true, upsert: true}).exec();
    return await getTransactionReference(transactionReference.reference);
};

export const getTransactionReference = async (reference, markUsed = false): Promise<{transactionReference: ITransactionReference}> => {
    const update = markUsed ? {used: true} : {};
    const transactionReference = await TransactionReference.findOneAndUpdate({reference: reference}, update).exec();
    if (!transactionReference) throw createError('Transaction reference not found', 404);
    return {transactionReference: transactionReference};
};

export const markReferenceUsed = async (reference) => {
    await TransactionReference.findOneAndUpdate({reference: reference}, {used: true}).exec();
    return {message: 'updated'};
};
