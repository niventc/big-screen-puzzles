import { Player } from '../player';

export class Party {
    public partyId: string;
    public players: Array<Player>;
    public currentGame: [string, string];
}