import * as admin from 'firebase-admin';

const serverKey = require('../../keys/air-treestie-firebase-adminsdk-8nrhs-716ae42fdc.json');
admin.initializeApp({
    credential: admin.credential.cert(serverKey),
    databaseURL: "https://air-treestie.firebaseio.com"
});
const Auth = admin.auth();
const Messaging = admin.messaging();

export {Auth, Messaging};
