import { GameProvider } from '../game.service';
import { Injectable } from '@angular/core';
import { Options, CodewordOptions, NewGame } from 'big-screen-puzzles-contract';
import { WebSocketService } from '../websocket.service';

@Injectable({
    providedIn: 'root'
})
export class CodewordGameProvider extends GameProvider {

    public options = [
        <CodewordOptions>{
            name: "Standard",
            width: 15,
            height: 15
        },
        // <CodewordOptions>{
        //     name: "Extreme",
        //     width: 20,
        //     height: 20
        // }
    ];

    public thisGame$ = this.game$;

    constructor(
        private webSocketService: WebSocketService
    ) {
        super();
    }
    
    public canHandleGame(type: string): boolean {
        return type === "codeword";
    }

    public getOptions(): Options[] {
        return this.options;
    }

    public newGame(options: CodewordOptions): void {
        const newGame = new NewGame();
        newGame.gameType = "codeword";
        newGame.options = options;
        this.webSocketService.sendMessage(newGame);
    }

}