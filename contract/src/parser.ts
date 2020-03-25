import { Message, Heartbeat, NewGame, JoinGame, PlayerConnected, NewGameCreated, JoinGameSucceeded, PlayerJoinedGame, PlayerUpdated, UpdatePlayer, GameOver } from './messages';
import { NewMinesweeperGame, SelectMinesweeperCell, MinesweeperCellSelected } from './minesweeper/messages';
import { CellFilled, KeyFilled, WordHighlighted, FillCell, FillKey, HighlightWord } from './codeword/messages';

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
            case "PlayerConnected":
                return Object.assign(new PlayerConnected(), typedMessage);
            case "PlayerJoinedGame":
                return Object.assign(new PlayerJoinedGame(), typedMessage);
            case "PlayerUpdated":
                return Object.assign(new PlayerUpdated(), typedMessage);
            case "NewGameCreated":
                return Object.assign(new NewGameCreated(), typedMessage);
            case "GameOver":
                return Object.assign(new GameOver(), typedMessage);

            case "MinesweeperCellSelected":
                return Object.assign(new MinesweeperCellSelected(), typedMessage);
                
            case "JoinGameSucceeded":
                return Object.assign(new JoinGameSucceeded(), typedMessage);
            case "CellFilled":
                return Object.assign(new CellFilled(), typedMessage);
            case "KeyFilled":
                return Object.assign(new KeyFilled(), typedMessage);
            case "WordHighlighted":
                return Object.assign(new WordHighlighted(), typedMessage);

            // Commands
            case "UpdatePlayer":
                return Object.assign(new UpdatePlayer(), typedMessage);
            case "JoinGame":
                return Object.assign(new JoinGame(), typedMessage);
                
            case "NewMinesweeperGame":
                return Object.assign(new NewMinesweeperGame(), typedMessage);
            case "SelectMinesweeperCell":
                return Object.assign(new SelectMinesweeperCell(), typedMessage);
                
            case "NewGame":
                return Object.assign(new NewGame(), typedMessage);
            case "FillCell":
                return Object.assign(new FillCell(), typedMessage);
            case "FillKey":
                return Object.assign(new FillKey(), typedMessage);
            case "HighlightWord":
                return Object.assign(new HighlightWord(), typedMessage);
            default:
                return undefined;
        }

    }

}