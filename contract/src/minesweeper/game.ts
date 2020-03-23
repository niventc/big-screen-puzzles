import { Game } from "../game";
import { MinesweeperCell } from './cell';

export class MinesweeperGame extends Game {
    public grid: Array<Array<MinesweeperCell>>;

    constructor() {
        super("minesweeper");
    }
}