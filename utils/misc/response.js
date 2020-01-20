"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResponseResolver {
    constructor(promise) {
        this.promise = promise;
    }
    resolve(req, res, next, status) {
        this.promise.then((result) => {
            sendResponse(res, result.statusCode || status, result);
        }).catch((err) => {
            next(err);
        });
    }
}
exports.ResponseResolver = ResponseResolver;
const sendResponse = (res, statusCode, result, message) => {
    result = result || { statusCode: 204, status: 'success' };
    if (typeof result !== 'object')
        result = result.toObject();
    result.statusCode = result.statusCode || statusCode;
    result.status = "success";
    result.messsage = message;
    res.header('Cache-Control', 'no-cache,no-store,must-revalidate');
    res.status(result.statusCode || statusCode || 200);
    res.json(result);
};
exports.sendResponse = sendResponse;
const sendError = (err, next) => {
    const error = new Error(err ? err.message : "A server error just occurred");
    error.statusCode = err && err.statusCode ? err.statusCode : 500;
    next(error);
};
exports.sendError = sendError;
const createError = (message, statusCode) => {
    const error = new Error(message || 'An unknown error has occurred');
    error.statusCode = statusCode || 500;
    error.status = 'failed';
    return error;
};
exports.createError = createError;
//# sourceMappingURL=response.js.map