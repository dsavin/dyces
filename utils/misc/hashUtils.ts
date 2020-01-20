import crypto from 'crypto';

export const saltHashPassword = (password: string) => {
    const salt = genRandomString(16);
    const encodedPassword = sha512(password, salt);
    return {password: encodedPassword.passwordHash, salt: encodedPassword.salt};
};

export const compareHash = (savedPassword: string, savedSalt: string, passwordAttempt: string) => {
    console.log('Checking: salt: ' + savedSalt);
    return savedPassword === sha512(passwordAttempt, savedSalt).passwordHash;
};

const genRandomString = (length) => {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};

const sha512 = (password, salt) => {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    const value = hash.digest('hex');
    return{salt: salt, passwordHash: value};
};