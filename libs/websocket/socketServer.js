"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = __importStar(require("ws"));
const socketManager_1 = require("./socketManager");
class SocketServer {
    constructor(server) {
        this.listen = () => {
            SocketServer.websocket.on('connection', async (socket, request) => {
                console.log('Request');
                socket.uid = request.uid.toString();
                socket.type = request.type;
                socket.isAlive = true;
                socketManager_1.sendEvent(socket.uid, new socketManager_1.EventModel().createFromEvent(socketManager_1.EventType.OUT_EVENT_ONLINE, {}));
                this.listenForSocketEvents(socket);
            });
        };
        this.listenForSocketEvents = (socket) => {
            socket.on('message', async (data) => {
                console.log('Socket message: ', data);
                socketManager_1.handleMessage(socket, new socketManager_1.EventModel().createFromAny(data));
            });
            socket.on('pong', data => {
                console.log('Pong: ', data);
                socket.isAlive = true;
            });
            socket.on('close', async (code, reason) => {
                console.log(`Closed. reason : ${reason}, code: ${code}, id: ${socket.uid}`);
                await socketManager_1.handleMessage(socket, new socketManager_1.EventModel().createFromEvent(socketManager_1.EventType.IN_EVENT_OFFLINE, {}));
            });
        };
        this.beginPing = () => {
            setInterval(function ping() {
                SocketServer.websocket.clients.forEach(function each(socket) {
                    if (socket.isAlive === false)
                        return socket.terminate();
                    socket.isAlive = false;
                    socket.ping(function noop() { });
                });
            }, 30000);
        };
        SocketServer.websocket = initWs(server);
        this.listen();
        this.beginPing();
    }
    static getWebsocketServer() {
        return this.websocket;
    }
}
exports.SocketServer = SocketServer;
function initWs(server) {
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
    if (!authorization)
        return next(false, 401, 'unauthorized', { 'X-WebSocket-Reject-Reason': 'unauthorized' });
    const entity = await exports.getEntity(authorization, next);
    if (!entity)
        return next(false, 401, 'unauthorized', { 'X-WebSocket-Reject-Reason': 'unauthorized' });
    info.req.uid = entity.uid;
    info.req.type = entity.type;
    next(true);
}
exports.getEntity = async (token, next) => {
    return null;
};
var SocketType;
(function (SocketType) {
    SocketType["TYPE_MERCHANT"] = "merchant";
    SocketType["TYPE_USER"] = "user";
})(SocketType = exports.SocketType || (exports.SocketType = {}));
//# sourceMappingURL=socketServer.js.map