"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socketServer_1 = require("./socketServer");
const firebaseUtils_1 = require("../firebase/firebaseUtils");
exports.handleMessage = (socket, eventModel) => {
    new Promise(async (accept, reject) => {
        try {
            switch (eventModel.eventType) {
            }
        }
        catch (e) {
            reject(e);
        }
    }).catch((err) => {
        console.error('Handle message err: ', err);
    });
};
exports.checkAnyOfTheseClientsOnline = (clients) => {
    const socketServer = socketServer_1.SocketServer.getWebsocketServer();
    if (!socketServer || !clients || clients.length === 0)
        return false;
    const sockets = Array.from(socketServer.clients);
    const filteredSockets = sockets.filter((socket) => {
        return clients.includes(socket.uid.toString());
    });
    return filteredSockets.length > 0;
};
exports.sendEvent = (uid, eventModel) => {
    const socketServer = socketServer_1.SocketServer.getWebsocketServer();
    if (!socketServer || !uid)
        return;
    const socket = Array.from(socketServer.clients).filter(client => client.uid.toString() === uid.toString())[0];
    if (socket) {
        socket.send(JSON.stringify({ event: eventModel.eventType, payload: eventModel.payload }));
    }
    if (eventModel.notification) {
        if (!eventModel.notification.eventType)
            eventModel.notification.setEventType(eventModel.eventType);
        firebaseUtils_1.sendFcmMessage(uid, eventModel.notification);
    }
};
exports.closeConnection = async (uid, message) => {
    try {
        const socketServer = socketServer_1.SocketServer.getWebsocketServer();
        if (!socketServer || !uid)
            return;
        const socket = Array.from(socketServer.clients).filter(client => client.uid.toString() === uid.toString())[0];
        if (socket) {
            socket.send(JSON.stringify({ event: EventType.OUT_EVENT_TERMINATED, payload: { reason: message } }));
            socket.terminate();
        }
    }
    catch (e) {
        console.error(e);
    }
};
class EventModel {
    constructor() {
        this.createFromEvent = (eventType, payload, notification) => {
            this.eventType = eventType;
            this.payload = payload;
            this.notification = notification;
            return this;
        };
        this.createFromAny = (data) => {
            try {
                const object = JSON.parse(data);
                if (!object.hasOwnProperty('event'))
                    return;
                this.eventType = object.event;
                this.payload = object.payload;
            }
            catch (e) {
                console.error('Json parse error: ', e);
            }
            return this;
        };
    }
}
exports.EventModel = EventModel;
// tslint:disable-next-line:max-classes-per-file
class SocketNotification extends EventModel {
    constructor(content, title, ticker, tag) {
        super();
        this.setEventType = (eventType) => {
            this.eventType = eventType;
            return this;
        };
        this.content = content;
        this.title = title;
        this.ticker = ticker;
        this.tag = tag;
    }
}
exports.SocketNotification = SocketNotification;
var EventType;
(function (EventType) {
    // In Events
    EventType["IN_EVENT_OFFLINE"] = "offline";
    // Out Events
    EventType["OUT_EVENT_ONLINE"] = "online";
    EventType["OUT_EVENT_TERMINATED"] = "terminated";
    EventType["OUT_EVENT_WALLET_FUNDED"] = "wallet_funded";
    EventType["OUT_EVENT_WALLET_CHARGED"] = "wallet_charged";
})(EventType = exports.EventType || (exports.EventType = {}));
//# sourceMappingURL=socketManager.js.map