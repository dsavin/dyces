"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const dotenv_1 = require("dotenv");
try {
    dotenv_1.config();
}
catch (e) {
    console.log('.env not available: ' + e.message);
}
const normalizedPath = path_1.join(__dirname, "models");
console.log('Normalized path: ', normalizedPath);
fs_1.readdirSync(normalizedPath).forEach((file) => {
    if (file.endsWith('js')) {
        console.log('Reading file: ', file);
        require("./models/" + file);
    }
});
//# sourceMappingURL=init.js.map