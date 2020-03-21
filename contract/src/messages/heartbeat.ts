import { Message } from './message';
import { Game } from '../codeword';
import { Player } from '../player';

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

export class PlayerNameChanged extends Message {
    public clientId: string;
    public name: string;

    constructor() {
        super("PlayerNameChanged");
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

/* Commands */
export class SetPlayerName extends Message {
    public name: string;

    constructor() {
        super("SetPlayerName");
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
