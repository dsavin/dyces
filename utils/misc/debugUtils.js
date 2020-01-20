"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by mcleroy on 2/5/2018.
 */
const debug = require('debug')('debugUtils');
debug.enabled = true;
exports.logMessage = (tag, message) => {
    console.log(`${tag}: `, message);
};
exports.logError = (tag, err, logTrace) => {
    console.error(`${tag}: `, logTrace ? err.stack : err.message);
};
exports.log = () => {
};
//# sourceMappingURL=debugUtils.js.map