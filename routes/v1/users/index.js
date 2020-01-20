"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const app = express_1.Router();
app.use('/auth', require('./auth'));
app.use(require('./authenticator'));
app.use('/wallets', require('./wallets'));
module.exports = app;
//# sourceMappingURL=index.js.map