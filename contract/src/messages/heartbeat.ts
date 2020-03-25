import { Message } from './message';
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

