import * as express from 'express';
import { Router } from 'express-ws';
import { WebsocketRequestHandler } from 'express-ws';

import { WebSocketController } from 'src/server';
import { OpenEvent } from 'ws';
import { Heartbeat, Parser, JoinGame, NewGame, NewGameCreated, Game } from 'big-screen-puzzles-contract';
import { ClientService, WebSocketClient } from 'src/client.service';
import { WordService } from 'src/words/word.service';
import { CodeWordService } from './codeword.service';

export class SessionController implements WebSocketController {

    private path = '/api/sessions';

    private games = new Map<string, Game>();

    private codeWordService: CodeWordService;

    constructor(
        private clientService: ClientService,
        private wordService: WordService
    ) {
        this.codeWordService = new CodeWordService(wordService);
    }

    public setup(router: Router): void {
        router.ws(this.path, this.onWebSocket);
    }

    public onWebSocket: WebsocketRequestHandler = (ws, req, next) => {
        // console.log("req", req);

        ws.on('open', (x, y) => {
            console.log("open");
        });
        
        ws.on('close', (x, y) => {
            console.log("close");
        });

        ws.on('message', (message: string) => {
            const parsedMessaged = Parser.parseMessageFromString(message);

            switch (parsedMessaged.constructor) {
                case Heartbeat:
                    // console.log("heartbeat");
                    break;
                case JoinGame:
                    console.log("join game " + (<JoinGame>parsedMessaged).gameId);

                    const gameId = (<JoinGame>parsedMessaged).gameId
                    const game = this.games.get(gameId);

                    if (!game) {
                        console.error(`No game found with id ${gameId}`);
                        // TODO send error
                    } else {
                        game.players.push((<WebSocketClient><unknown>ws).uuid);
                        game.players.forEach(clientId => {
                            // TODO filter current player
                            const client = this.clientService.getClient(clientId);
                            if (!client) {
                                console.warn(`Unable to find client with id ${clientId}`);
                                // TODO error/remove from game
                            } else {
                                ws.send("{\"message\": \"someone joined\"}");
                            }
                        });
                    }

                    break;
                case NewGame:
                    console.log("new game");
                    
                    const id = this.generateGameId();
                    const key = this.codeWordService.generateKey();
                    const grid = this.codeWordService.generateGrid(key);
                    const newGame = <Game>{
                        id: id,
                        grid: grid,
                        players: [
                            (<WebSocketClient><unknown>ws).uuid
                        ],
                        key: key
                    };
                    this.games.set(id, newGame);
                    const newGameCreated = new NewGameCreated();
                    newGameCreated.game = newGame;
                    ws.send(JSON.stringify(newGameCreated));
                    break;

            }

        });
    }

    private generateGameId(): string {
        return [
            this.wordService.getRandomWord("adv"),
            this.wordService.getRandomWord("verb"),
            this.wordService.getRandomWord("adj"),
            // this.wordService.getRandomWord("noun")
        ].join("-").toLowerCase();
    }
    
}
