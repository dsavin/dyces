"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin = __importStar(require("firebase-admin"));
const serverKey = require('../../keys/air-treestie-firebase-adminsdk-8nrhs-716ae42fdc.json');
admin.initializeApp({
    credential: admin.credential.cert(serverKey),
    databaseURL: "https://air-treestie.firebaseio.com"
});
const Auth = admin.auth();
exports.Auth = Auth;
const Messaging = admin.messaging();
exports.Messaging = Messaging;
//# sourceMappingURL=firebaseAdmin.js.map