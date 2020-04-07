import { Injectable, Inject } from "@angular/core";
import { WebSocketService } from './websocket.service';
import { NewGameCreated, Game, JoinGame, JoinGameSucceeded, Options } from 'big-screen-puzzles-contract';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';

export abstract class GameProvider {

    private gameSubject$ = new Subject<Game>();
    public game$: Observable<Game> = this.gameSubject$.asObservable()
        .pipe(
            shareReplay()
        );

    abstract canHandleGame(type: string): boolean;

    abstract getOptions(): Options[];

    abstract newGame(options: Options): void;

    public setGame(game: Game): void {
        this.gameSubject$.next(game);
    }
}

@Injectable()
export class GameService {

    public currentGameId: string;

    constructor(
        private router: Router,
        private webSocketService: WebSocketService,
        @Inject(GameProvider) private providers: GameProvider[]
    ) {
        console.log("Found these game providers", providers);

        // Without this the subscription doesn't exist for the provider until after the component is created... hmm...
        providers.forEach(p => p.game$.subscribe(g => console.log("got game", p, g)));

        this.webSocketService.message$
            .subscribe(message => {
                if (message.type === "NewGameCreated") {
                    const newGameCreated = message as NewGameCreated;
                    console.log("[NewGameCreated]", newGameCreated);

                    const provider = providers.find(p => p.canHandleGame(newGameCreated.game.type));
                    if (!provider) {
                        console.error(`Unable to find provider for game type '${newGameCreated.game.type}'`);
                    } else {
                        provider.setGame(newGameCreated.game);
                        this.router.navigate([newGameCreated.game.type, newGameCreated.game.id]);

                        this.currentGameId = newGameCreated.game.id;
                    }
                } else if (message.type === "JoinGameSucceeded") {
                    const joinGame = message as JoinGameSucceeded;
                    console.log("[JoinGameSucceeded]", joinGame);
                    const provider = providers.find(p => p.canHandleGame(joinGame.game.type));
                    if (!provider) {
                        console.error(`Unable to find provider for game type '${joinGame.game.type}'`);
                    } else {
                        provider.setGame(joinGame.game);
                        this.router.navigate([joinGame.game.type, joinGame.game.id]);

                        this.currentGameId = joinGame.game.id;
                    }
                }
            });
    }

    public getOptions(type: string): Options[] {
        const provider = this.providers.find(p => p.canHandleGame(type));
        if (!provider) {
            console.error(`Unable to find provider for game type '${type}'`);
            return [];
        } else {
            return provider.getOptions();
        }
    }

    public newGame(type: string, options: Options): void {
        const provider = this.providers.find(p => p.canHandleGame(type));
        if (!provider) {
            console.error(`Unable to find provider for game type '${type}'`);
        } else {
            provider.newGame(options);
        }
    }

    public joinGame(gameCode: string): void {
        const joinGame = new JoinGame();
        joinGame.gameId = gameCode;
        this.webSocketService.sendMessage(joinGame);
    }

}