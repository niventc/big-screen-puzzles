import { Player } from './player';

export class Game {
    public id: string;
    public startedAt: Date;
    public players: Array<Player> = [];

    constructor(
        public type: string
    ) {}
}