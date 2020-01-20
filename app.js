"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const response_1 = require("./utils/misc/response");
const app = express_1.default();
const cors = require('cors');
app.use(cors());
app.use(morgan_1.default("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(cookie_parser_1.default());
app.get('/', (req, res) => {
    response_1.sendResponse(res, 200, { message: 'Ok' });
});
app.use("/v1", require("./routes/v1/index"));
// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error("Invalid endpoint");
    err.statusCode = 404;
    err.status = "failed";
    next(err);
});
// error handler
// noinspection JSUnusedLocalSymbols
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    const error = {};
    error.message = err.message;
    error.error = req.app.get("env") === "development" ? err : {};
    error.statusCode = err.statusCode ? err.statusCode : 500;
    error.status = "failed";
    const url = req.protocol + "://" + req.get("host") + req.originalUrl;
    console.error({ errorUrl: url, error: err });
    res.status(error.statusCode);
    res.json(error);
});
module.exports = app;
//# sourceMappingURL=app.js.map