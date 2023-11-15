"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
exports.Logger = {
    log: (message) => {
        console.log("[LOG]", message);
    },
    warn: (message) => {
        console.warn("[WARN]", message);
    },
    error: (message) => {
        console.error("[ERROR]", message);
    }
};
//# sourceMappingURL=logger.js.map