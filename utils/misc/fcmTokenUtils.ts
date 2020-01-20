import {FcmToken, IFcmToken} from "../../models/fcmToken";

export const addFcmToken = async (uid, token): Promise<{token: string}> => {
    const fcmToken = await FcmToken.findOneAndUpdate({uid: uid}, {
        token: token
    }, {upsert: true, new: true}).lean().exec();
    return {token: fcmToken.token};
};

export const getFcmToken = async (uid): Promise<string | null> => {
    const fcmToken: IFcmToken = await FcmToken.findOne({uid: uid}).lean().exec();
    return fcmToken ? fcmToken.token : null;
};