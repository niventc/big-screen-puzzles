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
    public gameId: string;
    
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