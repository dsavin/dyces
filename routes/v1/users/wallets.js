"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const walletUtils = require("../../../utils/users/walletUtils");
const response_1 = require("../../../utils/misc/response");
const app = express_1.Router();
app.get('/', (req, res, next) => {
    walletUtils.getWallet(req.query.uid).then((result) => {
        response_1.sendResponse(res, 200, result);
    }).catch((err) => {
        response_1.sendError(err, next);
    });
});
app.put('/fund', (req, res, next) => {
    walletUtils.fundUserWallet(req.query.uid, req.body.amount).then((result) => {
        response_1.sendResponse(res, 200, result);
    }).catch((err) => {
        response_1.sendError(err, next);
    });
});
module.exports = app;
//# sourceMappingURL=wallets.js.map