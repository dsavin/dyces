import {Router} from "express";
const app = Router();

app.use('/auth', require('./auth'));
app.use(require('./authenticator'));
app.use('/wallets', require('./wallets'));

module.exports = app;