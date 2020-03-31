import { Message } from './message';
import { Player } from '../player';
import { Game } from '../game';
import { Options } from '../options';

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
    public value: string | number;
    public byPlayer: Player;

    constructor() {
        super("CellFilled");
    }
}

export class CellHighlighted extends Message {
    public x: number;
    public y: number;
    public byPlayer: Player;

    constructor() {
        super("CellHighlighted");
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

export class FillCell extends Message {
    public gameId: string;
    public x: number;
    public y: number;
    public value: string | number;

    constructor() {
        super("FillCell");
    }
}

export class HighlightCell extends Message {
    public gameId: string;
    public x: number;
    public y: number;

    constructor() {
        super("HighlightCell");
    }
}

export class NewGame extends Message {
    public gameType: string;
    public options: Options;

    constructor() {
        super("NewGame");
    }
}

export class GameOver extends Message {
    public isSuccess: boolean;
    public timeTaken: number;

    constructor() {
        super("GameOver");
    }
}

export class JoinGame extends Message {
    public gameId: string;

    constructor() {
        super("JoinGame");
    }
}

