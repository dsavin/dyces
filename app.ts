import cookieParser from "cookie-parser";
import express from "express";
import logger from "morgan";
import {sendResponse} from "./utils/misc/response";

const app = express();
const cors = require('cors');

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', (req, res) => {
    sendResponse(res, 200, {message: 'Ok'});
});
app.use("/v1", require("./routes/v1/index"));

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err: any = new Error("Invalid endpoint");
    err.statusCode = 404;
    err.status = "failed";
    next(err);
});

// error handler
// noinspection JSUnusedLocalSymbols
app.use((err: any, req: any, res: any, next: any) => {
    // set locals, only providing error in development
    const error: any = {};
    error.message = err.message;
    error.error = req.app.get("env") === "development" ? err : {};
    error.statusCode = err.statusCode ? err.statusCode :  500;
    error.status = "failed";
    const url = req.protocol + "://" + req.get("host") + req.originalUrl;
    console.error({errorUrl: url, error: err});
    res.status(error.statusCode);
    res.json(error);
});

module.exports = app;
