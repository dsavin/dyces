"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
exports.saltHashPassword = (password) => {
    const salt = genRandomString(16);
    const encodedPassword = sha512(password, salt);
    return { password: encodedPassword.passwordHash, salt: encodedPassword.salt };
};
exports.compareHash = (savedPassword, savedSalt, passwordAttempt) => {
    console.log('Checking: salt: ' + savedSalt);
    return savedPassword === sha512(passwordAttempt, savedSalt).passwordHash;
};
const genRandomString = (length) => {
    return crypto_1.default.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};
const sha512 = (password, salt) => {
    const hash = crypto_1.default.createHmac('sha512', salt);
    hash.update(password);
    const value = hash.digest('hex');
    return { salt: salt, passwordHash: value };
};
//# sourceMappingURL=hashUtils.js.map