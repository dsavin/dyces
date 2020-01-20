import {AuthToken, AuthTokenType, IAuthToken} from "../../models/authToken";
import jwt from "jsonwebtoken";
const jwtSecret = process.env.JWT_SECRET;

export const addAuthToken = async (uid, email, type: AuthTokenType): Promise<{token: string}> => {
    const token = jwt.sign({phone: email}, jwtSecret, {expiresIn: '1yr'});
    const authToken = await AuthToken.findOneAndUpdate({uid: uid, type: type}, {
        token: token
    }, {upsert: true, new: true}).lean().exec();
    return {token: authToken.token};
};

export const getAuthToken = async (uid: string, type: AuthTokenType): Promise<string | null> => {
    const authToken: IAuthToken = await AuthToken.findOne({uid: uid, type: type}).lean().exec();
    return authToken ? authToken.token : null;
};

export const verifyToken = async (token: string, type: AuthTokenType): Promise<string> => {
    token = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
    console.log('Token: ', token);
    const authToken: IAuthToken = await AuthToken.findOne({token: token, type: type}).lean().exec();
    if (!authToken) return null;
    try {
        jwt.verify(token, jwtSecret);
    } catch (e) {
        return null;
    }
    return authToken.uid;
};