import { Message } from './message';
import { CodewordGame } from '../codeword';
import { Player } from '../player';
import { Game } from '../game';

export class Heartbeat extends Message {    
    constructor() {
        super("Heartbeat");
    }    
}

/* Events */
export class PlayerConnected extends Message {
    public player: Player;

    constructor() {
        super("PlayerConnected");
    }
}

export class PlayerUpdated extends Message {
    public player: Player;

    constructor() {
        super("PlayerUpdated");
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
    public player: Player;

    constructor() {
        super("PlayerJoinedGame");
    }
}

export class CellFilled extends Message {
    public x: number;
    public y: number;
    public value: string;
    public byPlayer: Player;

    constructor() {
        super("CellFilled");
    }
}

export class KeyFilled extends Message {
    public key: number;
    public value: string;
    public byPlayer: Player;

    constructor() {
        super("KeyFilled");
    }
}

export class WordHighlighted extends Message {
    public word: string;
    public byPlayer: Player;

    constructor() {
        super("WordHighlighted");
    }
}

/* Commands */
export class UpdatePlayer extends Message {
    public name?: string;
    public colour?: string;

    constructor() {
        super("UpdatePlayer");
    }
}

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

export class HighlightWord extends Message {
    public gameId: string;
    public word: string;

    constructor() {
        super("HighlightWord");
    }
}
