import * as WebSocket from "ws";
import {IncomingMessage, Server as HttpServer} from "http";
import {EventModel, EventType, handleMessage, sendEvent} from "./socketManager";

export class SocketServer {
    public static getWebsocketServer(): WebSocket.Server {
        return this.websocket;
    }
    private static websocket: WebSocket.Server;

    constructor(server: HttpServer) {
        SocketServer.websocket = initWs(server);
        this.listen();
        this.beginPing();
    }

    private listen = () => {
        SocketServer.websocket.on('connection', async (socket: ISocket, request: IRequest) => {
            console.log('Request');
            socket.uid = request.uid.toString();
            socket.type = request.type;
            socket.isAlive = true;
            sendEvent(socket.uid, new EventModel().createFromEvent(EventType.OUT_EVENT_ONLINE, {}));
            this.listenForSocketEvents(socket);
        });
    }
    private listenForSocketEvents = (socket: ISocket) => {
        socket.on('message', async data => {
            console.log('Socket message: ', data);
            handleMessage(socket, new EventModel().createFromAny(data));
        });

        socket.on('pong', data => {
            console.log('Pong: ', data);
            socket.isAlive = true;
        });
        socket.on('close', async (code, reason) => {
            console.log(`Closed. reason : ${reason}, code: ${code}, id: ${socket.uid}`);
            await handleMessage(socket, new EventModel().createFromEvent(EventType.IN_EVENT_OFFLINE, {}));
        });
    }
    private beginPing = () => {
        setInterval(function ping() {
            SocketServer.websocket.clients.forEach(function each(socket: ISocket) {
                if (socket.isAlive === false) return socket.terminate();
                socket.isAlive = false;
                socket.ping(function noop() {});
            });
        }, 30000);
    }
}

function initWs(server): WebSocket.Server {
    return new WebSocket.Server({
        server: server,
        clientTracking: true,
        verifyClient: verifyClient
    });
}

async function verifyClient(info, next) {
    const reqUrl = new URL(`wss://${info.req.headers.host}${info.req.url}`);
    const authorization = info.req.headers.authorization || reqUrl.searchParams.get('token');
    // const deviceId = info.req.headers.deviceId || reqUrl.searchParams.get('deviceId');
    console.log(`>>Verifying client. Authorization: ${authorization}`);
    if (!authorization) return next(false, 401, 'unauthorized', {'X-WebSocket-Reject-Reason': 'unauthorized'});
    const entity = await getEntity(authorization, next);
    if (!entity) return next(false, 401, 'unauthorized', {'X-WebSocket-Reject-Reason': 'unauthorized'});
    info.req.uid = entity.uid;
    info.req.type = entity.type;
    next(true);
}

export const getEntity = async (token, next): Promise<{uid: string, type: string}> => {
    return null;
};
export enum SocketType {
    TYPE_MERCHANT = 'merchant',
    TYPE_USER = 'user',
}
export interface ISocket extends WebSocket {
    uid?: string;
    type?: SocketType;
    isAlive?: boolean;
}

export interface IRequest extends IncomingMessage {
    uid: string;
    type: SocketType;
}
