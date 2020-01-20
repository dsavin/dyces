import {readdirSync} from "fs";
import {join} from "path";

import {config} from "dotenv";

try {
    config();
} catch (e) {
    console.log('.env not available: ' + e.message);
}

const normalizedPath = join(__dirname, "models");
console.log('Normalized path: ', normalizedPath);

readdirSync(normalizedPath).forEach((file) => {
    if (file.endsWith('js')) {
        console.log('Reading file: ', file);
        require("./models/" + file);
    }
});
