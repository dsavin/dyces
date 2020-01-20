import {Router} from "express";
import walletUtils = require('../../../utils/users/walletUtils');
import {sendError, sendResponse} from "../../../utils/misc/response";
const app = Router();

app.get('/', (req, res, next) => {
    walletUtils.getWallet(req.query.uid).then((result) => {
        sendResponse(res, 200, result);
    }).catch((err) => {
        sendError(err, next);
    });
});

app.put('/fund', (req, res, next) => {
    walletUtils.fundUserWallet(req.query.uid, req.body.amount).then((result) => {
        sendResponse(res, 200, result);
    }).catch((err) => {
        sendError(err, next);
    });
});

module.exports = app;