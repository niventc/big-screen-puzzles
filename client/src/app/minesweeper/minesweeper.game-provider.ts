import { GameProvider } from '../game.service';
import { Injectable } from '@angular/core';
import { MinesweeperGame, NewMinesweeperGame, MinesweeperOptions } from 'big-screen-puzzles-contract';
import { WebSocketService } from '../websocket.service';

@Injectable({
    providedIn: "root"
})
export class MinesweeperGameProvider extends GameProvider {

    public options = [
        <MinesweeperOptions>{
          name: "Easy",
          numberOfMines: 10,
          width: 8,
          height: 8
        },
        <MinesweeperOptions>{
          name: "Intermediate",
          numberOfMines: 40,
          width: 16,
          height: 16
        },
        <MinesweeperOptions>{
          name: "Hard",
          numberOfMines: 99,
          width: 24,
          height: 24
        },
        <MinesweeperOptions>{
          name: "Expert",
          numberOfMines: 200,
          width: 24,
          height: 30
        }
    ];

    public game: MinesweeperGame;
    public gameId: string;
    public isGameOver = false;

    public thisGame$ = this.game$;

    constructor(
        private webSocketService: WebSocketService
    ) {
        super();
    }
    
    public canHandleGame(type: string): boolean {
        return type === "minesweeper";
    }

    public getOptions(): MinesweeperOptions[] {
        return this.options;
    }
    
    public newGame(options: MinesweeperOptions): void {
        const newGame = new NewMinesweeperGame();
        newGame.options = options;
        this.webSocketService.sendMessage(newGame);
    }
}
