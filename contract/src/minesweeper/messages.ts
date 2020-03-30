import { Message } from '../messages/message';
import { Player } from '../player';
import { MinesweeperGame } from './game';

export class MinesweeperGameCreated extends Message {
    public game: MinesweeperGame;

    constructor() {
        super("MinesweeperGameCreated");
    }
}

export class SelectMinesweeperCell extends Message {
    public gameId: string;
    public x: number;
    public y: number;
    public placeFlag: boolean;

    constructor() {
        super("SelectMinesweeperCell");
    }
}

export class MinesweeperCellSelected extends Message {
    public x: number;
    public y: number;
    public isFlag: boolean;
    public byPlayer: Player;

    constructor() {
        super("MinesweeperCellSelected");
    }
}
