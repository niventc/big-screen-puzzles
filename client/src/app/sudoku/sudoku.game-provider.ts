import { GameProvider } from '../game.service';
import { Injectable } from '@angular/core';
import { Options, NewGame, SudokuOptions } from 'big-screen-puzzles-contract';
import { WebSocketService } from '../websocket.service';

@Injectable({
    providedIn: 'root'
})
export class SudokuGameProvider extends GameProvider {

    public options = [
        <SudokuOptions>{
            name: "Easy",
            startingUncoveredCount: 36 // >= 36
        },
        <SudokuOptions>{
            name: "Medium",
            startingUncoveredCount: 30 // 27 - 36
        },
        <SudokuOptions>{
            name: "Hard",
            startingUncoveredCount: 24 // 19 - 26
        },
        <SudokuOptions>{
            name: "Evil",
            startingUncoveredCount: 18 // < 18
        }
    ];

    public thisGame$ = this.game$;

    constructor(
        private webSocketService: WebSocketService
    ) {
        super();
    }
    
    public canHandleGame(type: string): boolean {
        return type === "sudoku";
    }

    public getOptions(): Options[] {
        return this.options;
    }

    public newGame(options: SudokuOptions): void {
        const newGame = new NewGame();
        newGame.gameType = "sudoku";
        newGame.options = options;
        this.webSocketService.sendMessage(newGame);
    }

}