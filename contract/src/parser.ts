import { Message, Heartbeat, NewGame, JoinGame, PlayerConnected, NewGameCreated, JoinGameSucceeded, PlayerJoinedGame, PlayerUpdated, UpdatePlayer, GameOver, CellFilled, FillCell, HighlightCell, CellHighlighted } from './messages';
import { SelectMinesweeperCell, MinesweeperCellSelected } from './minesweeper/messages';
import { KeyFilled, WordHighlighted, FillKey, HighlightWord } from './codeword/messages';
import { StartParty, JoinParty, LeaveParty, PartyJoined, JoinedParty, LeftParty } from './party';

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
            case "CellHighlighted":
                return Object.assign(new CellHighlighted(), typedMessage);
            case "KeyFilled":
                return Object.assign(new KeyFilled(), typedMessage);
            case "WordHighlighted":
                return Object.assign(new WordHighlighted(), typedMessage);

            // Commands
            case "UpdatePlayer":
                return Object.assign(new UpdatePlayer(), typedMessage);
            case "JoinGame":
                return Object.assign(new JoinGame(), typedMessage);
                
            case "SelectMinesweeperCell":
                return Object.assign(new SelectMinesweeperCell(), typedMessage);
                
            case "NewGame":
                return Object.assign(new NewGame(), typedMessage);
            case "FillCell":
                return Object.assign(new FillCell(), typedMessage);
            case "HighlightCell":
                return Object.assign(new HighlightCell(), typedMessage);
            case "FillKey":
                return Object.assign(new FillKey(), typedMessage);
            case "HighlightWord":
                return Object.assign(new HighlightWord(), typedMessage);

            // Party
            case "StartParty":
                return Object.assign(new StartParty(), typedMessage);
            case "JoinParty":
                return Object.assign(new JoinParty(), typedMessage);
            case "LeaveParty":
                return Object.assign(new LeaveParty(), typedMessage);
            
            case "PartyJoined":
                return Object.assign(new PartyJoined(), typedMessage);
            case "JoinedParty":
                return Object.assign(new JoinedParty(), typedMessage);
            case "LeftParty":
                return Object.assign(new LeftParty(), typedMessage);
            // case "JoinParty":
            //     return Object.assign(new JoinParty(), typedMessage);
            // case "JoinParty":
            //     return Object.assign(new JoinParty(), typedMessage);

            default:
                return undefined;
        }

    }

}