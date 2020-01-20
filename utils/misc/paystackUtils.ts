import request from 'request-promise';
import {IUser} from "../../models/user";
import {addTransactionReference, getTransactionReference} from "./transactionReferenceUtils";
import {createError} from "./response";
import {Card} from "../../models/card";
import {TransactionDescription, TransactionReason} from "../../models/transactionReference";
import {fundUserWallet} from "../users/walletUtils";

export const initializePayment = async (uid: string, email: string, amount: number, itemId, reason: TransactionReason, callbackUrl: string):
    Promise<{paymentStatus: string, authorizationUrl: string, reference: string, accessCode: string}> => {
    const transactionReference = (await addTransactionReference(uid, amount, itemId, reason)).transactionReference;
    const result = await request({
        url: 'https://api.paystack.co/transaction/initialize',
        body: {
            email: email,
            amount: amount * 100,
            reference: transactionReference.reference,
            callback_url: callbackUrl
        },
        headers: getHeaders(),
        method: 'POST',
        timeout: (60 * 1000),
        json: true
    });
    return {
        paymentStatus: 'open_link',
        authorizationUrl: result.data.authorization_url,
        reference: result.data.reference,
        accessCode: result.data.access_code
    };
};

export const chargeAndSaveCard = async (uid: string, email: string, card, amount, reason, itemId, saveCard?: boolean) => {
    if (!amount) throw createError('Amount is required', 400);
    if (!reason) throw createError('Reason is required', 400);
    const transactionReference = (await addTransactionReference(uid, amount, itemId, reason, saveCard)).transactionReference;
    card.uid = uid;
    const paystackCard = {
        number: card.number,
        cvv: card.cvv,
        expiry_month: card.expMonth,
        expiry_year: card.expYear
    };
    const result = await request({
        url: 'https://api.paystack.co/charge',
        body: {
            email: email,
            amount: amount * 100,
            card: paystackCard,
            reference: transactionReference.reference
        },
        headers: getHeaders(),
        method: 'POST',
        timeout: (60 * 1000),
        json: true
    }).catch((err) => {
        handleError(err);
    });
    const data = result.data;
    // noinspection JSUnresolvedVariable
    const message = (data.status.toLowerCase() === 'send_pin' || data.status.toLowerCase() === 'send_otp')
        ? data.display_text : data.message;
    // noinspection JSUnresolvedVariable
    if (data.authorization && !data.authorization.reusable)
        throw createError('Card cannot be used', 400);
    await checkCardTransactionApproved(result);
    return {
        message: message,
        paymentStatus: data.status,
        gatewayResponse: data.gateway_response,
        reference: data.reference,
        url: data.url,
        timeout: (60 * 1000),
        data: data
    };
};

export const chargeCard = async (uid: string, user: IUser, cardId: string, amount: number, reason: TransactionReason, itemId: string): Promise<{
    message: string,
    paymentStatus: string,
    gatewayResponse: string,
    reference: string,
    url: string,
    timeout: number,
    data: string
}> => {
    amount = amount * 100;
    const transactionReference = (await addTransactionReference(uid, amount, itemId, reason)).transactionReference;
    const card = await Card.findOne({_id: cardId}).exec();
    if (!card) return  {
        message: 'Card not available',
        paymentStatus: 'failed',
        gatewayResponse: 'Card not available',
        reference: transactionReference.reference,
        url: null,
        timeout: (60 * 1000),
        data: null
    };
    console.log('Charging authorization: ' + card.authorizationCode);
    const result = await request({
        url: 'https://api.paystack.co/transaction/charge_authorization',
        body: {
            email: user.email,
            amount: amount,
            authorization_code: card.authorizationCode,
            reference: transactionReference.reference,
            metadata: {
                custom_fields: [
                    {
                        display_name: 'Customer Name',
                        variable_name: 'customer_name',
                        value: user.firstName + ' ' + user.lastName
                    },
                    {
                        display_name: 'Item',
                        variable_name: 'item',
                        value: reason
                    },
                    {
                        display_name: 'Item Id',
                        variable_name: 'item_id',
                        value:  itemId
                    }
                ]
            }
        },
        headers: getHeaders(),
        method: 'POST',
        json: true
    }).catch((err) => {
        handleError(err);
    });
    const data = result.data;
    // noinspection JSUnresolvedVariable
    const message = (data.status.toLowerCase() === 'send_pin' || data.status.toLowerCase() === 'send_otp')
        ? data.display_text : data.gateway_response != null ? data.gateway_response :  data.message;
    await checkCardTransactionApproved(result);
    // noinspection JSUnresolvedVariable
    return {
        message: message,
        paymentStatus: data.status,
        gatewayResponse: data.gateway_response,
        reference: data.reference,
        url: data.url,
        timeout: (60 * 1000),
        data: data
    };
};

export const submitPin = async (pin, reference) => {
    const result = await request({
        url: 'https://api.paystack.co/charge/submit_pin',
        body: {pin: pin, reference: reference},
        headers: getHeaders(),
        method: 'POST',
        timeout: (60 * 1000),
        json: true
    }).catch((err) => {
        handleError(err);
    });
    await checkCardTransactionApproved(result);
    const data = result.data;
    // noinspection JSUnresolvedVariable
    const message = (data.status.toLowerCase() === 'send_pin' || data.status.toLowerCase() === 'send_otp')
        ? data.display_text : data.message;
    // noinspection JSUnresolvedVariable
    return {
        message: message,
        paymentStatus: data.status,
        gatewayResponse: data.gateway_response,
        url: data.url,
        reference: data.reference,
        data: data
    };
};

export const submitOtp = async (otp, reference) => {
    const result = await request({
        url: 'https://api.paystack.co/charge/submit_otp',
        body: {otp: otp, reference: reference},
        headers: getHeaders(),
        method: 'POST',
        timeout: (60 * 1000),
        json: true
    }).catch((err) => {
        handleError(err);
    });
    const data = result.data;
    await checkCardTransactionApproved(result);
    // noinspection JSUnresolvedVariable
    const message = (data.status.toLowerCase() === 'send_pin' || data.status.toLowerCase() === 'send_otp')
        ? data.display_text : data.message;
    // noinspection JSUnresolvedVariable
    return {
        message: message,
        paymentStatus: data.status,
        gatewayResponse: data.gateway_response,
        url: data.url,
        reference: data.reference, data: data
    };
};

export const getPaymentState = async (reference) => {
    const result = await request({
        url: `https://api.paystack.co/charge/${reference}`,
        headers: getHeaders(),
        method: 'GET',
        timeout: (60 * 1000),
        json: true
    }).catch((err) => {
        handleError(err);
    });
    const data = result.data;
    await checkCardTransactionApproved(result);
    const message = data.message ? data.message : result.message;
    // noinspection JSUnresolvedVariable
    return {
        message: message,
        paymentStatus: data.status,
        gatewayResponse: data.gateway_response, reference: data.reference, data: data
    };
};

const checkCardTransactionApproved = async (result) => {
    console.log('Checking card transaction approved: ', JSON.stringify(result.data));
    const data = result.data;
    const amount = data.amount / 100;
    const authorization = data.authorization;
    const transactionReference = (await getTransactionReference(data.reference, true)).transactionReference;
    if (data.status.toLowerCase() === 'success') {
        // noinspection JSUnusedLocalSymbols
        if (transactionReference.used) {
            console.warn('Transaction reference already used');
            return;
        }
        if (transactionReference.reason === TransactionReason.USER_WALLET_FUNDING) {
            await fundUserWallet(transactionReference.uid.toString(), amount);
        }
    }
};

export const generateTransferReceiptCode = async (accountName, accountNumber, bank) => {
    const transferReceiptResult = await request({
        url: `https://api.paystack.co/transferrecipient`,
        headers: getHeaders(),
        method: 'POST',
        body: {
            type: 'nuban',
            name: accountName,
            account_number: accountNumber,
            bank_code: bank.code,
            currency: 'NGN'
        },
        timeout: (60 * 1000),
        json: true
    }).catch((err) => {
        handleError(err);
    });
    if (!transferReceiptResult.status)
        throw createError('Transfer receipt creation failed', 400);
    console.log('Paystack transfer receipt result: ', JSON.stringify(transferReceiptResult));
    const data = transferReceiptResult.data;
    // noinspection JSUnresolvedVariable
    return data.recipient_code;
};

export const transferToAccount = async (uid, amount, recipientCode, reason: TransactionReason, description: TransactionDescription, itemId) => {
    const transferResult = await request({
        url: `https://api.paystack.co/transfer`,
        headers: getHeaders(),
        method: 'POST',
        body: {
            source: 'balance',
            reason: description,
            amount: amount * 100,
            recipient: recipientCode
        },
        timeout: (60 * 1000),
        json: true
    }).catch((err) => {
        handleError(err);
    });
    if (!transferResult.status)
        throw createError('Transfer failed', 400);
    const data = transferResult.data;
    await addTransactionReference(uid, amount, itemId, reason);
    return data;
};

export const validateTransaction = async (body) => {
    const event = body.event;
    const data = body.data;
    console.log(`Validating transaction. Event: ${event}, Reference: ${data.reference} `);
    switch (event) {
        case 'charge.success':
            await this.getPaymentState(data.reference);
            break;
    }
    return body;
};

export const listBanks = async () => {
    const result = await request({
        url: `https://api.paystack.co/bank`,
        headers: getHeaders(),
        method: 'GET',
        timeout: (60 * 1000),
        json: true
    }).catch((err) => {
        handleError(err);
    });
    if (!result.status)
        throw createError('Unable to retrieve banks', 400);
    return {
        banks: result.data
    };
};

export const resolveBvnAndAccountNumber = async (bvn, accountNumber, bankCode) => {
    const accountInfo: any = {};
    const bvnResult = await request({
        url: `https://api.paystack.co/bank/resolve_bvn/${bvn}`,
        headers: getHeaders(),
        method: 'GET',
        timeout: (60 * 1000),
        json: true
    }).catch((err) => {
        handleError(err);
    });
    console.log('Bvn result: ', bvnResult);
    if (!bvnResult.status)
        throw createError('Bvn Resolution failed', 400);
    const bvnData = bvnResult.data;
    accountInfo.firstName = bvnData.first_name;
    accountInfo.lastName = bvnData.last_name;
    accountInfo.dob = bvnData.dob;
    accountInfo.mobile = bvnData.mobile;
    accountInfo.bvn = bvnData.bvn;
    const accountNumberResult = await request({
        url: `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        headers: getHeaders(),
        method: 'GET',
        timeout: (60 * 1000),
        json: true
    }).catch((err) => {
        handleError(err);
    });
    if (!accountNumberResult.status)
        throw createError('Account number Resolution failed', 400);
    const accountNumberData = accountNumberResult.data;
    accountInfo.accountNumber = accountNumberData.account_number;
    accountInfo.accountName = accountNumberData.account_name;
    console.log('Account number result: ', accountNumberResult);
};

const handleError = (err) => {
    const error = err.error;
    console.error('****Original Error message: ', err.message);
    if (!error) throw createError('Payment failed', 500);
    if (!error.data)throw createError(error.message ? error.message : 'Payment failed', 400);
    const data = error.data;
    throw createError(data.message, 400);
};

function getHeaders() {
    return {
        Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
        Accept: 'application/json'
    };
}
