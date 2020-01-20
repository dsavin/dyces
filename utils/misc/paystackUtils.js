"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_promise_1 = __importDefault(require("request-promise"));
const transactionReferenceUtils_1 = require("./transactionReferenceUtils");
const response_1 = require("./response");
const card_1 = require("../../models/card");
const transactionReference_1 = require("../../models/transactionReference");
const walletUtils_1 = require("../users/walletUtils");
exports.initializePayment = async (uid, email, amount, itemId, reason, callbackUrl) => {
    const transactionReference = (await transactionReferenceUtils_1.addTransactionReference(uid, amount, itemId, reason)).transactionReference;
    const result = await request_promise_1.default({
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
exports.chargeAndSaveCard = async (uid, email, card, amount, reason, itemId, saveCard) => {
    if (!amount)
        throw response_1.createError('Amount is required', 400);
    if (!reason)
        throw response_1.createError('Reason is required', 400);
    const transactionReference = (await transactionReferenceUtils_1.addTransactionReference(uid, amount, itemId, reason, saveCard)).transactionReference;
    card.uid = uid;
    const paystackCard = {
        number: card.number,
        cvv: card.cvv,
        expiry_month: card.expMonth,
        expiry_year: card.expYear
    };
    const result = await request_promise_1.default({
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
        throw response_1.createError('Card cannot be used', 400);
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
exports.chargeCard = async (uid, user, cardId, amount, reason, itemId) => {
    amount = amount * 100;
    const transactionReference = (await transactionReferenceUtils_1.addTransactionReference(uid, amount, itemId, reason)).transactionReference;
    const card = await card_1.Card.findOne({ _id: cardId }).exec();
    if (!card)
        return {
            message: 'Card not available',
            paymentStatus: 'failed',
            gatewayResponse: 'Card not available',
            reference: transactionReference.reference,
            url: null,
            timeout: (60 * 1000),
            data: null
        };
    console.log('Charging authorization: ' + card.authorizationCode);
    const result = await request_promise_1.default({
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
                        value: itemId
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
        ? data.display_text : data.gateway_response != null ? data.gateway_response : data.message;
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
exports.submitPin = async (pin, reference) => {
    const result = await request_promise_1.default({
        url: 'https://api.paystack.co/charge/submit_pin',
        body: { pin: pin, reference: reference },
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
exports.submitOtp = async (otp, reference) => {
    const result = await request_promise_1.default({
        url: 'https://api.paystack.co/charge/submit_otp',
        body: { otp: otp, reference: reference },
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
exports.getPaymentState = async (reference) => {
    const result = await request_promise_1.default({
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
    const transactionReference = (await transactionReferenceUtils_1.getTransactionReference(data.reference, true)).transactionReference;
    if (data.status.toLowerCase() === 'success') {
        // noinspection JSUnusedLocalSymbols
        if (transactionReference.used) {
            console.warn('Transaction reference already used');
            return;
        }
        if (transactionReference.reason === transactionReference_1.TransactionReason.USER_WALLET_FUNDING) {
            await walletUtils_1.fundUserWallet(transactionReference.uid.toString(), amount);
        }
    }
};
exports.generateTransferReceiptCode = async (accountName, accountNumber, bank) => {
    const transferReceiptResult = await request_promise_1.default({
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
        throw response_1.createError('Transfer receipt creation failed', 400);
    console.log('Paystack transfer receipt result: ', JSON.stringify(transferReceiptResult));
    const data = transferReceiptResult.data;
    // noinspection JSUnresolvedVariable
    return data.recipient_code;
};
exports.transferToAccount = async (uid, amount, recipientCode, reason, description, itemId) => {
    const transferResult = await request_promise_1.default({
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
        throw response_1.createError('Transfer failed', 400);
    const data = transferResult.data;
    await transactionReferenceUtils_1.addTransactionReference(uid, amount, itemId, reason);
    return data;
};
exports.validateTransaction = async (body) => {
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
exports.listBanks = async () => {
    const result = await request_promise_1.default({
        url: `https://api.paystack.co/bank`,
        headers: getHeaders(),
        method: 'GET',
        timeout: (60 * 1000),
        json: true
    }).catch((err) => {
        handleError(err);
    });
    if (!result.status)
        throw response_1.createError('Unable to retrieve banks', 400);
    return {
        banks: result.data
    };
};
exports.resolveBvnAndAccountNumber = async (bvn, accountNumber, bankCode) => {
    const accountInfo = {};
    const bvnResult = await request_promise_1.default({
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
        throw response_1.createError('Bvn Resolution failed', 400);
    const bvnData = bvnResult.data;
    accountInfo.firstName = bvnData.first_name;
    accountInfo.lastName = bvnData.last_name;
    accountInfo.dob = bvnData.dob;
    accountInfo.mobile = bvnData.mobile;
    accountInfo.bvn = bvnData.bvn;
    const accountNumberResult = await request_promise_1.default({
        url: `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        headers: getHeaders(),
        method: 'GET',
        timeout: (60 * 1000),
        json: true
    }).catch((err) => {
        handleError(err);
    });
    if (!accountNumberResult.status)
        throw response_1.createError('Account number Resolution failed', 400);
    const accountNumberData = accountNumberResult.data;
    accountInfo.accountNumber = accountNumberData.account_number;
    accountInfo.accountName = accountNumberData.account_name;
    console.log('Account number result: ', accountNumberResult);
};
const handleError = (err) => {
    const error = err.error;
    console.error('****Original Error message: ', err.message);
    if (!error)
        throw response_1.createError('Payment failed', 500);
    if (!error.data)
        throw response_1.createError(error.message ? error.message : 'Payment failed', 400);
    const data = error.data;
    throw response_1.createError(data.message, 400);
};
function getHeaders() {
    return {
        Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
        Accept: 'application/json'
    };
}
//# sourceMappingURL=paystackUtils.js.map