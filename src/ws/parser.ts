export class Message {
    type: string;
    data: any;
    constructor(type: string, data: any) {
        this.type = type;
        this.data = data;
    }

    toString(): string {
        return JSON.stringify(this);
    }
}

export class MessageParser {
    static parse(message: string): Message {
        const JSONMessage: any = JSON.parse(message);
        return new Message(JSONMessage.type, JSONMessage.data);
    }
}