import { Message } from './message';

export class Heartbeat extends Message {    
    constructor() {
        super("Heartbeat");
    }    
}

/* Events */
export class ClientConnected extends Message {
    public clientId: string;

    constructor() {
        super("ClientConnected");
    }
}

/* Commands */
export class NewGame extends Message {
    constructor() {
        super("NewGame");
    }
}

export class NewGameCreated extends Message {
    public game: Game;
    
    constructor() {
        super("NewGameCreated");
    }
}

export class JoinGame extends Message {
    public gameId: string;

    constructor() {
        super("JoinGame");
    }
}

export class Cell {
    public value: string;
    public key: number;
    
    public isEmpty: boolean;
    public isSolved = false;

    public static EmptyCell(): Cell {
        const cell = new Cell();
        cell.isEmpty = true;
        return cell;
    }

    public setValue(value: string, key: Array<string>): void {
        if (this.value && value != this.value) {
            throw new Error(`Cannot set cell value to ${value} as value is already set with ${this.value}`);
        }
        this.value = value;
        this.key = key.indexOf(value) + 1;
        this.isEmpty = false;
    }
}

export interface Game {
    id: string;
    grid: Array<Array<Cell>>;
    players: Array<string>;
    key: Array<string>;
}