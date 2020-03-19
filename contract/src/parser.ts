import { Message, Heartbeat, NewGame, JoinGame, ClientConnected, NewGameCreated } from './messages';

export class Parser {

    static parseMessageFromString(message: string): Message {
        const object = JSON.parse(message);
        return this.parseMessageFromObject(object);
    }

    static parseMessageFromObject(message: Object): Message {
        if (!message.hasOwnProperty("type")) {
            return undefined;
        }
        let typedMessage = message as Message;

        switch (typedMessage.type) {
            case "Heartbeat":
                return Object.assign(new Heartbeat(), typedMessage);

            // Events
            case "ClientConnected":
                return Object.assign(new ClientConnected(), typedMessage);
            case "NewGameCreated":
                return Object.assign(new NewGameCreated(), typedMessage);

            // Commands
            case "NewGame":
                return Object.assign(new NewGame(), typedMessage);
            case "JoinGame":
                return Object.assign(new JoinGame(), typedMessage);
            default:
                return undefined;
        }

    }

}