import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.join(projectRoot, "src");

function findNativeFolders(directory) {
    const nativeFolders = [];

    if (!fs.existsSync(directory)) {
        return nativeFolders;
    }

    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;

        const fullPath = path.join(directory, entry.name);

        if (entry.name === "native") {
            nativeFolders.push(fullPath);
            continue;
        }

        nativeFolders.push(...findNativeFolders(fullPath));
    }

    return nativeFolders;
}

const nativeFolders = findNativeFolders(srcRoot)
    .map(folder =>
        path.relative(projectRoot, folder).replaceAll("\\", "/")
    );

console.log("Discovered native directories:", nativeFolders);

export default {
    general: {
        name: "expense-optimizer",
    },

    target: {
        runtimeEnv: "node",
    },

    paths: {
        config: import.meta.url,
        native: nativeFolders,
        output: "dist",
    },
};