"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebaseAdmin_1 = require("./firebaseAdmin");
const fcmTokenUtils_1 = require("../../utils/misc/fcmTokenUtils");
exports.sendFcmMessage = (uid, notification) => {
    console.log('Falling back to fcm for event: ', notification.eventType);
    new Promise(async (accept) => {
        const fcmToken = await fcmTokenUtils_1.getFcmToken(uid);
        // console.log('notifying event: %s, uid: %s, payload: %s ', event, uid, JSON.stringify(payload));
        if (!fcmToken) {
            console.error(`Person: ${uid} not found to notify`);
            return;
        }
        await sendFirebaseMessage([fcmToken], notification);
        accept();
    }).catch((err) => {
        console.error('Notification error: ', err);
    });
};
const sendFirebaseMessage = async (fcmTokens, notification) => {
    // console.log('<<FCM>>: %s, fcmTokens: %s, payload: %s ', event, fcmTokens, JSON.stringify(mPayload));
    const payload = {
        data: {
            event: notification.eventType,
            notification: JSON.stringify(notification)
        }
    };
    const options = {
        priority: "high",
        timeToLive: 60 * 10
    };
    // console.log('Fcm sending. Payload: ', mPayload);
    const response = await firebaseAdmin_1.Messaging.sendToDevice(fcmTokens, payload, options);
    console.log('Fcm response: ', JSON.stringify(response));
    return response;
};
//# sourceMappingURL=firebaseUtils.js.map