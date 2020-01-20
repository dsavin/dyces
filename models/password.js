"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const passwordSchema = new mongoose_1.Schema({
    uid: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true }
}, { timestamps: true });
exports.Password = mongoose_1.model('password', passwordSchema);
//# sourceMappingURL=password.js.map