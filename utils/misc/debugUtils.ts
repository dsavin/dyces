/**
 * Created by mcleroy on 2/5/2018.
 */
const debug = require ('debug')('debugUtils');
debug.enabled = true;

export const logMessage = (tag: string, message: any) => {
    console.log(`${tag}: `, message);
};

export const logError = (tag: string, err: Error, logTrace?) => {
    console.error(`${tag}: `, logTrace ? err.stack : err.message);
};

export const log = () => {

};