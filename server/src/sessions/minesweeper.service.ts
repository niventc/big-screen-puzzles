import { MinesweeperOptions, MinesweeperCell, MinesweeperGame, MinesweeperCellSelected, Player } from 'big-screen-puzzles-contract';

interface MinesweeperCellWrapper extends MinesweeperCell {
    x: number;
    y: number;
}

export class MinesweeperService {

    public generateGame(options: MinesweeperOptions): MinesweeperGame {
        const game = new MinesweeperGame();
        game.grid = this.generateGrid(options);
        game.startedAt = new Date(Date.now());
        return game;
    }

    public generateGrid(options: MinesweeperOptions): Array<Array<MinesweeperCell>> {
        // Make grid
        let grid = new Array<Array<MinesweeperCell>>();
        for (let y = 0; y < options.height; y++) {
            grid[y] = new Array<MinesweeperCell>();
            for (let x = 0; x < options.width; x++) {
                grid[y][x] = new MinesweeperCell();
            }  
        }

        // Place mines
        let minesPlaced = 0;
        while (minesPlaced <= options.numberOfMines) {
            const randY = Math.round(Math.random() * (options.height - 1));
            const randX = Math.round(Math.random() * (options.width - 1));

            if (!grid[randY][randX].isMine) {
                grid[randY][randX].isMine = true;
                minesPlaced++;
            }
        }

        // Count touching mines
        for (let y = 0; y < options.height; y++) {
            for (let x = 0; x < options.width; x++) {
                const cell = grid[y][x];

                const neighbouringCells = [
                    this.safeGetGrid(grid, y-1, x), // above
                    this.safeGetGrid(grid, y+1, x), // below
                    this.safeGetGrid(grid, y, x-1), // left
                    this.safeGetGrid(grid, y, x+1), // right
                    this.safeGetGrid(grid, y-1, x-1), // top left
                    this.safeGetGrid(grid, y-1, x+1), // top right
                    this.safeGetGrid(grid, y+1, x-1), // bottom left
                    this.safeGetGrid(grid, y+1, x+1) // bottom right
                ];

                const count = neighbouringCells.filter(f => f && f.isMine).length;

                cell.touchingMineCount = count;
            }  
        }

        console.log("Generated minesweeper grid", grid);
        return grid;
    }

    public getEmptyNeighbours(grid: Array<Array<MinesweeperCell>>, x: number, y: number, player: Player): Array<MinesweeperCellSelected> {
        // If we bigger than 0, dont check
        console.log("checking", y, x)
        if (this.safeGetGrid(grid, y, x).touchingMineCount > 0) {
            return [];
        }
        return this.getNeighboursUpToMine(grid, x, y, [])
            .map(c => {
                grid[c.y][c.x].isSelected = true;
                grid[c.y][c.x].selectedBy = player;

                const message = new MinesweeperCellSelected();
                message.x = c.x;
                message.y = c.y;
                message.byPlayer = player;
                return message;
            });
    }

    private getNeighboursUpToMine(grid: Array<Array<MinesweeperCell>>, x: number, y: number, seen: [number, number][]): Array<MinesweeperCellWrapper> {
        const neighbourDirections = new Array<[number, number]>(
            [y-1, x],
            [y+1, x],
            [y, x-1],
            [y, x+1],
            [y-1, x-1],
            [y-1, x+1],
            [y+1, x-1],
            [y+1, x+1]
        );

        const unseen = neighbourDirections
            .filter(d => !seen.find(s => d[0] === s[0] && d[1] === s[1]));

        unseen.forEach(d => seen.push(d));
        
        const neighbouringCells = unseen.map(d => this.safeGetGrid(grid, d[0], d[1]));

        console.log("checking", neighbouringCells);

        let moreNeighbouringCells = [];
        neighbouringCells
            .filter(c => !!c)
            .forEach(c => {
                if (c.isMine) {
                    // do nothing
                } else if (c.touchingMineCount === 0) {
                    moreNeighbouringCells.push(...this.getNeighboursUpToMine(grid, c.x, c.y, seen));
                    moreNeighbouringCells.push(c);
                } else  {
                    moreNeighbouringCells.push(c);
                }
            });

        return moreNeighbouringCells;
    }

    public areAllCellsSelected(grid: Array<Array<MinesweeperCell>>): boolean {
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[0].length; x++) {                
                const cell = grid[y][x];

                // not selected and not a mine, still needs revealing
                if (!cell.isSelected && !cell.isMine) {
                    console.log("cell not selected and not mine", x, y);
                    return false;
                }
            }
        }
        return true;
    }

    private safeGetGrid(grid: Array<Array<MinesweeperCell>>, y: number, x: number): MinesweeperCellWrapper {
        try {
            const cell = grid[y][x];
            if (!cell) {
                return undefined;
            }
            return {...cell, x: x, y: y};
        } catch {
            return undefined;
        }
    }

}
