import { Message } from '../messages/message';
import { Player } from '../player';
import { Party } from './party';

// A player starts a party
export class StartParty extends Message {
    constructor() {
        super("StartParty");
    }
}

// Another player asks to join party
export class JoinParty extends Message {
    public partyId: string;

    constructor() {
        super("JoinParty");
    }
}

// Player opts to leave a party
export class LeaveParty extends Message {
    public partyId: string;

    constructor() {
        super("LeaveParty");
    }
}

// The player that started/joined the party receives this
export class PartyJoined extends Message {
    public party: Party;

    constructor() {
        super("PartyJoined");
    }
}

// All other party members are notified of a player joining the party
export class JoinedParty extends Message {
    public partyId: string;
    public player: Player;

    constructor() {
        super("JoinedParty");
    }
}

// Sent to remaining party members when player leaves party
export class LeftParty extends Message {
    public partyId: string;
    public player: Player;

    constructor() {
        super("LeftParty");
    }
}