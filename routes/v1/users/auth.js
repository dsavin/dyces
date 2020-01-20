"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authUtils = require("../../../utils/users/authUtils");
const response_1 = require("../../../utils/misc/response");
const app = express_1.Router();
app.post('/checkPhone', (req, res, next) => {
    authUtils.checkPhone(req.body).then((result) => {
        response_1.sendResponse(res, 200, result);
    }).catch((err) => {
        response_1.sendError(err, next);
    });
});
app.post('/verifyPhone', (req, res, next) => {
    authUtils.verifyPhone(req.body).then((result) => {
        response_1.sendResponse(res, 200, result);
    }).catch((err) => {
        response_1.sendError(err, next);
    });
});
app.post('/login', (req, res, next) => {
    authUtils.login(req.body).then((result) => {
        response_1.sendResponse(res, 200, result);
    }).catch((err) => {
        response_1.sendError(err, next);
    });
});
app.post('/signUp', (req, res, next) => {
    authUtils.register(req.body).then((result) => {
        response_1.sendResponse(res, 200, result);
    }).catch((err) => {
        response_1.sendError(err, next);
    });
});
app.post('/resetPassword', (req, res, next) => {
    authUtils.resetPassword(req.body).then((result) => {
        response_1.sendResponse(res, 200, result);
    }).catch((err) => {
        response_1.sendError(err, next);
    });
});
module.exports = app;
//# sourceMappingURL=auth.js.map