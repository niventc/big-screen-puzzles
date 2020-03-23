import { MinesweeperOptions, MinesweeperCell, MinesweeperGame } from 'big-screen-puzzles-contract';

export class MinesweeperService {

    public generateGame(options: MinesweeperOptions): MinesweeperGame {
        const game = new MinesweeperGame();
        game.grid = this.generateGrid(options);
        game.startedAt = new Date(Date.now());
        return game;
    }

    public generateGrid(options: MinesweeperOptions): Array<Array<MinesweeperCell>> {
        let minesPlaced = 0;
        let grid = new Array<Array<MinesweeperCell>>();
        for (let y = 0; y < options.height; y++) {
            grid[y] = new Array<MinesweeperCell>();
            for (let x = 0; x < options.width; x++) {
                grid[y][x] = new MinesweeperCell();
            }  
        }

        while (minesPlaced <= options.numberOfMines) {
            const randY = Math.round(Math.random() * (options.height - 1));
            const randX = Math.round(Math.random() * (options.width - 1));

            if (!grid[randY][randX].isMine) {
                grid[randY][randX].isMine = true;
                minesPlaced++;
            }
        }

        console.log("Generated minesweeper grid", grid);
        return grid;
    }

}
