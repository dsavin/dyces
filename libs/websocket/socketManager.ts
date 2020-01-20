import {SocketServer, ISocket, SocketType} from "./socketServer";
import {sendFcmMessage} from "../firebase/firebaseUtils";

export const handleMessage = (socket: ISocket, eventModel: EventModel) => {
    new Promise(async (accept, reject) => {
        try {
            switch (eventModel.eventType) {
            }
        } catch (e) {
            reject(e);
        }
    }).catch((err) => {
        console.error('Handle message err: ', err);
    });
};

export const checkAnyOfTheseClientsOnline = (clients: string[]): boolean => {
    const socketServer = SocketServer.getWebsocketServer();
    if (!socketServer || !clients || clients.length === 0) return false;
    const sockets = Array.from(socketServer.clients);
    const filteredSockets = sockets.filter((socket: ISocket) => {
       return clients.includes(socket.uid.toString());
    });
    return filteredSockets.length > 0;
};

export const sendEvent = (uid, eventModel: EventModel) => {
    const socketServer = SocketServer.getWebsocketServer();
    if (!socketServer || !uid) return;
    const socket = Array.from(socketServer.clients).filter(client => (client as ISocket).uid.toString() === uid.toString())[0];
    if (socket) {
        socket.send(JSON.stringify({event: eventModel.eventType, payload: eventModel.payload}));
    }
    if (eventModel.notification) {
        if (!eventModel.notification.eventType)
            eventModel.notification.setEventType(eventModel.eventType);
        sendFcmMessage(uid, eventModel.notification);
    }
};

export const closeConnection = async (uid, message) => {
    try {
        const socketServer = SocketServer.getWebsocketServer();
        if (!socketServer || !uid) return;
        const socket = Array.from(socketServer.clients).filter(client => (client as ISocket).uid.toString() === uid.toString())[0];
        if (socket) {
            socket.send(JSON.stringify({event: EventType.OUT_EVENT_TERMINATED, payload: {reason: message}}));
            socket.terminate();
        }
    } catch (e) {
        console.error(e);
    }
};

export class EventModel {
    public eventType: EventType;
    public payload: object;
    public notification: SocketNotification;

    public createFromEvent = (eventType: EventType, payload: any, notification?: SocketNotification): EventModel => {
        this.eventType = eventType;
        this.payload = payload;
        this.notification = notification;
        return this;
    }
    public createFromAny = (data: any): EventModel => {
        try {
            const object = JSON.parse(data);
            if (!object.hasOwnProperty('event')) return;
            this.eventType = object.event;
            this.payload = object.payload;
        } catch (e) {
            console.error('Json parse error: ', e);
        }
        return this;
    }
}

// tslint:disable-next-line:max-classes-per-file
export class SocketNotification extends EventModel {
    public content: string;
    public title?: string;
    public ticker?: string;
    public tag?: string;

    constructor(content: string, title?: string, ticker?: string, tag?: string) {
        super();
        this.content = content;
        this.title = title;
        this.ticker = ticker;
        this.tag = tag;
    }

    public setEventType = (eventType: EventType): SocketNotification => {
        this.eventType = eventType;
        return this;
    }
}

export enum EventType {
    // In Events
    IN_EVENT_OFFLINE = 'offline',
    // Out Events
    OUT_EVENT_ONLINE = 'online',
    OUT_EVENT_TERMINATED = 'terminated',
    OUT_EVENT_WALLET_FUNDED = 'wallet_funded',
    OUT_EVENT_WALLET_CHARGED = 'wallet_charged'
}