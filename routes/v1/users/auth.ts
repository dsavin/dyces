import {Router} from "express";
import authUtils = require('../../../utils/users/authUtils');
import {sendError, sendResponse} from "../../../utils/misc/response";
const app = Router();

app.post('/checkPhone', (req, res, next) => {
    authUtils.checkPhone(req.body).then((result) => {
        sendResponse(res, 200, result);
    }).catch((err) => {
        sendError(err, next);
    });
});

app.post('/verifyPhone', (req, res, next) => {
    authUtils.verifyPhone(req.body).then((result) => {
        sendResponse(res, 200, result);
    }).catch((err) => {
        sendError(err, next);
    });
});

app.post('/login', (req, res, next) => {
    authUtils.login(req.body).then((result) => {
        sendResponse(res, 200, result);
    }).catch((err) => {
        sendError(err, next);
    });
});

app.post('/signUp', (req, res, next) => {
    authUtils.register(req.body).then((result) => {
        sendResponse(res, 200, result);
    }).catch((err) => {
        sendError(err, next);
    });
});

app.post('/resetPassword', (req, res, next) => {
    authUtils.resetPassword(req.body).then((result) => {
        sendResponse(res, 200, result);
    }).catch((err) => {
        sendError(err, next);
    });
});

module.exports = app;