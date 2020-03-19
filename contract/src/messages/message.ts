export class Message {
    readonly type: string | "Heartbeat";

    constructor(type: string | "Heartbeat") {
        this.type = type;
    }
}