import { Message, Heartbeat, NewGame, JoinGame, ClientConnected, NewGameCreated, JoinGameSucceeded, PlayerJoinedGame, FillCell, CellFilled, KeyFilled, FillKey } from './messages';

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
            case "JoinGameSucceeded":
                return Object.assign(new JoinGameSucceeded(), typedMessage);
            case "PlayerJoinedGame":
                return Object.assign(new PlayerJoinedGame(), typedMessage);
            case "CellFilled":
                return Object.assign(new CellFilled(), typedMessage);
            case "KeyFilled":
                return Object.assign(new KeyFilled(), typedMessage);

            // Commands
            case "NewGame":
                return Object.assign(new NewGame(), typedMessage);
            case "JoinGame":
                return Object.assign(new JoinGame(), typedMessage);
            case "FillCell":
                return Object.assign(new FillCell(), typedMessage);
            case "FillKey":
                return Object.assign(new FillKey(), typedMessage);
            default:
                return undefined;
        }

    }

}