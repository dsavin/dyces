import {NextFunction, Request, Response} from "express";

class ResponseResolver {

    public readonly promise: Promise<any>;

    constructor(promise: Promise<any>) {
        this.promise = promise;
    }

    public resolve(req: Request, res: Response, next: NextFunction, status?: number): void {
        this.promise.then((result: any) => {
           sendResponse(res, result.statusCode || status, result);
        }).catch((err) => {
            next(err);
        });
    }
}

const sendResponse = (res: Response, statusCode: number, result: any, message?: string): void => {
    result = result || {statusCode: 204, status: 'success'};
    if (typeof result !== 'object')
        result = result.toObject();
    result.statusCode = result.statusCode || statusCode;
    result.status = "success";
    result.messsage = message;
    res.header('Cache-Control', 'no-cache,no-store,must-revalidate');
    res.status(result.statusCode || statusCode || 200);
    res.json(result);
};

const sendError = (err: Error, next: NextFunction) => {
    const error: any = new Error(err ? err.message : "A server error just occurred");
    error.statusCode = err && (err as any).statusCode ? (err as any).statusCode : 500;
    next(error);
};

const createError = (message?: string, statusCode?: number): Error => {
    const error: any = new Error(message || 'An unknown error has occurred');
    error.statusCode = statusCode || 500;
    error.status = 'failed';
    return error;
};

export {ResponseResolver, sendResponse, sendError, createError};