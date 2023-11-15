export const Logger = {
    log: (message: string) => {
        console.log("[LOG]", message);
    },
    warn: (message: string) => {
        console.warn("[WARN]", message);
    },
    error: (message: string) => {
        console.error("[ERROR]", message);
    }
}