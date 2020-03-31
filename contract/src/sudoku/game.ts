import { Game } from '../game';
import { SudokuCell } from './cell';
import { CellHighlighted } from '../messages';

export class SudokuGame extends Game {
    public grid: Array<Array<SudokuCell>>;
    public highlightedCells: { [key: string]: CellHighlighted };

    constructor() {
        super("sudoku");
    }
}