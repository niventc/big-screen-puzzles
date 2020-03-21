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

export class NewGameCreated extends Message {
    public game: Game;
    
    constructor() {
        super("NewGameCreated");
    }
}

export class JoinGameSucceeded extends Message {
    public game: Game;

    constructor() {
        super("JoinGameSucceeded");
    }
}

export class PlayerJoinedGame extends Message {
    public clientId: string;

    constructor() {
        super("PlayerJoinedGame");
    }
}

export class CellFilled extends Message {
    public x: number;
    public y: number;
    public value: string;
    public byPlayer: string;

    constructor() {
        super("CellFilled");
    }
}

export class KeyFilled extends Message {
    public key: number;
    public value: string;
    public byPlayer: string;

    constructor() {
        super("KeyFilled");
    }
}

/* Commands */
export class NewGame extends Message {
    public width: number;
    public height: number;

    constructor() {
        super("NewGame");
    }
}

export class JoinGame extends Message {
    public gameId: string;

    constructor() {
        super("JoinGame");
    }
}

export class FillKey extends Message {
    public gameId: string;
    public key: number;
    public value: string;

    constructor() {
        super("FillKey");
    }
}

export class FillCell extends Message {
    public gameId: string;
    public x: number;
    public y: number;
    public value: string;

    constructor() {
        super("FillCell");
    }
}

export class Key {
    public value: string;
    public key: number;
    public playerValue: string;
}

export class Cell {
    public value: string;
    public key: number;
    public playerValue: string;
    
    public isEmpty: boolean;
    public isSolved = false;

    public static EmptyCell(): Cell {
        const cell = new Cell();
        cell.isEmpty = true;
        return cell;
    }

    public setValue(value: string, key: Array<Key>): void {
        if (this.value && value != this.value) {
            throw new Error(`Cannot set cell value to ${value} as value is already set with ${this.value}`);
        }
        this.value = value;
        this.key = key.find(k => k.value === value).key;
        this.isEmpty = false;
    }
}

export interface Game {
    id: string;
    grid: Array<Array<Cell>>;
    players: Array<string>;
    key: Array<Key>;
}