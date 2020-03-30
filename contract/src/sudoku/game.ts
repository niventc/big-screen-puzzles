import { Game } from '../game';
import { SudokuCell } from './cell';

export class SudokuGame extends Game {
    public grid: Array<Array<SudokuCell>>;

    constructor() {
        super("sudoku");
    }
}