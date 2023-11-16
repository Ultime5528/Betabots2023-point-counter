"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageParser = exports.Message = void 0;
class Message {
    constructor(type, data) {
        this.type = type;
        this.data = data;
    }
    toString() {
        return JSON.stringify(this);
    }
}
exports.Message = Message;
class MessageParser {
    static parse(message) {
        const JSONMessage = JSON.parse(message);
        return new Message(JSONMessage.type, JSONMessage.data);
    }
}
exports.MessageParser = MessageParser;
//# sourceMappingURL=parser.js.map