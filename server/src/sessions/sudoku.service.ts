import { SudokuCell, SudokuOptions, SudokuGame } from 'big-screen-puzzles-contract';


export class SudokuService {

    public generateGame(options: SudokuOptions): SudokuGame {
        const game = new SudokuGame();

        game.grid = this.generateGrid();
        game.startedAt = new Date(Date.now());
        game.highlightedCells = {};

        let uncoveredCount = 0;
        while (uncoveredCount < options.startingUncoveredCount) {
            const x = Math.round(Math.random() * 8);
            const y = Math.round(Math.random() * 8);

            if (!game.grid[y][x].isLocked) {
                game.grid[y][x].isLocked = true;
                uncoveredCount++;
            }
        }

        return game;
    }

    public generateGrid(): Array<Array<SudokuCell>> {
        const start = Date.now();
        let isGridComplete = false;
        let grid: Array<Array<SudokuCell>>;
        while (!isGridComplete) {
            grid = new Array<Array<SudokuCell>>();

            for (let y = 0; y < 9; y++) {
                grid[y] = new Array<SudokuCell>();
                for (let x = 0; x < 9; x++) {
                    grid[y][x] = new SudokuCell();
                }
            }

            for (let y = 0; y < 9; y++) {
                for (let x = 0; x < 9; x++) {
                    const possibleNumbers = new Set([1,2,3,4,5,6,7,8,9]);
                    // remove numbers already in row
                    const row = this.getNumbersInRow(grid, y);
                    row.forEach(n => possibleNumbers.delete(n));
                    // remove numbers already in column
                    const column = this.getNumbersInColumn(grid, x);
                    column.forEach(n => possibleNumbers.delete(n));
                    // remove numbers already in sector
                    const sector = this.getNumbersInSector(grid, x, y);
                    sector.forEach(n => possibleNumbers.delete(n));

                    // get random number that is not in the above set
                    const cell = new SudokuCell();
                    cell.value = this.getRandomNumberFrom(possibleNumbers);
                    grid[y][x] = cell;
                    // console.log(`setting ${x},${y} to ${grid[y][x]}`);
                }
            }

            let complete = true;
            for (let y = 0; y < 9; y++) {
                for (let x = 0; x < 9; x++) {
                    if (!grid[y][x].value) {
                        complete = false;
                    }
                }
            }
            isGridComplete = complete;
        }
        const taken = Date.now() - start;
        console.log(`Generated sudoku grid in ${taken}ms`);
        this.prettyPrint(grid);

        return grid;
    }

    private getNumbersInRow(grid: Array<Array<SudokuCell>>, y: number): Array<number> {
        return grid[y].map(cell => cell.value);
    }

    private getNumbersInColumn(grid: Array<Array<SudokuCell>>, x: number): Array<number> {
        let column = new Array<number>();
        for (let y = 0; y < 9; y++) {
            column.push(grid[y][x].value);
        }
        return column;
    }

    private getNumbersInSector(grid: Array<Array<SudokuCell>>, x: number, y: number): Array<number> {

        /*
        0,0 0,1 0,2 | 0,3 0,4 0,5 | 0,6 0,7 0,8
        1,0 1,1 1,2 | 1,3 1,4 1,5 | 1,6 1,7 1,8
        2,0 2,1 2,2 | 2,3 2,4 2,5 | 2,6 2,7 2,8
        ---------------------------------------
        3,0 3,1 3,2 | 3,3 3,4 3,5 | 3,6 3,7 3,8
        4,0 4,1 4,2 | 4,3 4,4 4,5 | 4,6 4,7 4,8
        5,0 5,1 5,2 | 5,3 5,4 5,5 | 5,6 5,7 5,8
        ---------------------------------------
        6,0 6,1 6,2 |
        */

        let xStart;
        let xEnd;
        if (x < 3) {
            xStart = 0;
            xEnd = 3;
        } else if (x < 6) {
            xStart = 3;
            xEnd = 6;
        } else {
            xStart = 6;
            xEnd = 9;
        }

        let yStart;
        let yEnd;
        if (y < 3) {
            yStart = 0;
            yEnd = 3;
        } else if (y < 6) {
            yStart = 3;
            yEnd = 6;
        } else {
            yStart = 6;
            yEnd = 9;
        }

        const results = new Array<number>();
        for (let yIndex = yStart; yIndex < yEnd; yIndex++) {
            for (let xIndex = xStart; xIndex < xEnd; xIndex++) {
                results.push(grid[yIndex][xIndex].value);
            }
        }
        return results;
    }

    private getRandomNumberFrom(numbers: Set<number>): number {
        const randomIndex = Math.min(Math.round(Math.random() * numbers.size), numbers.size - 1);
        return Array.from(numbers.values())[randomIndex];
    }

    private prettyPrint(grid: Array<Array<SudokuCell>>): void {
        console.log(grid.map(row => row.map(cell => cell.value).join(",")).join("\r\n"));
    }

}