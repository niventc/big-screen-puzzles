import * as express from 'express';
import { Router } from 'express-ws';
import { WebsocketRequestHandler } from 'express-ws';

import { WebSocketController } from 'src/server';
import { OpenEvent } from 'ws';
import { Heartbeat, Parser, JoinGame, NewGame, NewGameCreated, Game, PlayerJoinedGame, JoinGameSucceeded, FillCell, CellFilled, FillKey, KeyFilled } from 'big-screen-puzzles-contract';
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
                    const joinGame = parsedMessaged as JoinGame;
                    console.log("join game", joinGame);
                    this.joinGame(joinGame, <WebSocketClient><unknown>ws);
                    break;
                case NewGame:
                    const newGame = parsedMessaged as NewGame;
                    console.log("new game", newGame);
                    this.newGame(newGame, <WebSocketClient><unknown>ws);
                    break;

                case FillCell:
                    const fillCell = parsedMessaged as FillCell;
                    console.log("fill cell", fillCell);
                    this.fillCell(fillCell, (<WebSocketClient><unknown>ws).uuid);
                    break;

                case FillKey:
                    const fillKey = parsedMessaged as FillKey;
                    console.log("fill key", fillKey);
                    this.fillKey(fillKey, (<WebSocketClient><unknown>ws).uuid);
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

    private newGame(newGame: NewGame, ws: WebSocketClient): void {
        const id = this.generateGameId();
        const key = this.codeWordService.generateKey();
        const grid = this.codeWordService.generateGrid(newGame.width, newGame.height, key);
        const game = <Game>{
            id: id,
            grid: grid,
            players: [
                ws.uuid
            ],
            key: key
        };
        this.games.set(id, game);
        const newGameCreated = new NewGameCreated();
        newGameCreated.game = game;
        ws.send(JSON.stringify(newGameCreated));
    }

    private joinGame(message: JoinGame, ws: WebSocketClient): void {
        const currentPlayer = ws.uuid;
        const gameId = message.gameId
        const game = this.games.get(gameId);

        if (!game) {
            console.error(`No game found with id ${gameId}`);
            // TODO send error
            return;
        }

        game.players.push(currentPlayer);

        const joinGameSucceeded = new JoinGameSucceeded();
        joinGameSucceeded.game = game;
        ws.send(JSON.stringify(joinGameSucceeded));

        const playerJoinedGame = new PlayerJoinedGame();
        playerJoinedGame.clientId = currentPlayer;
        game.players
            .filter(player => player !== currentPlayer)
            .forEach(clientId => {
                const client = this.clientService.getClient(clientId);
                if (!client) {
                    console.warn(`Unable to find client with id ${clientId}`);
                    // TODO error/remove from game
                } else {
                    console.log(`Sending to ${clientId}`, playerJoinedGame);
                    client.send(JSON.stringify(playerJoinedGame));
                }
            });
    }

    private fillCell(message: FillCell, clientId: string): void {
        console.log("fill cell", message);

        const game = this.games.get(message.gameId);
        if (!game) {
            console.error(`game ${message.gameId} not found!`);
            return;
        }

        game.grid[message.x][message.y].playerValue = message.value;

        const cellFilled = new CellFilled();
        cellFilled.x = message.x;
        cellFilled.y = message.y;
        cellFilled.value = message.value;
        cellFilled.byPlayer = clientId;
        
        game.players
            .filter(player => player !== clientId)
            .forEach(clientId => {
                const client = this.clientService.getClient(clientId);
                if (!client) {
                    console.warn(`Unable to find client with id ${clientId}`);
                    // TODO error/remove from game
                } else {
                    console.log(`Sending to ${clientId}`, cellFilled);
                    client.send(JSON.stringify(cellFilled));
                }
            });        
    }

    private fillKey(message: FillKey, clientId: string): void {
        console.log("fill cell", message);

        const game = this.games.get(message.gameId);
        if (!game) {
            console.error(`game ${message.gameId} not found!`);
            return;
        }

        game.key.find(k => k.key === message.key).playerValue = message.value;

        const keyFilled = new KeyFilled();
        keyFilled.key = message.key;
        keyFilled.value = message.value;
        keyFilled.byPlayer = clientId;
        
        game.players
            .filter(player => player !== clientId)
            .forEach(clientId => {
                const client = this.clientService.getClient(clientId);
                if (!client) {
                    console.warn(`Unable to find client with id ${clientId}`);
                    // TODO error/remove from game
                } else {
                    console.log(`Sending to ${clientId}`, keyFilled);
                    client.send(JSON.stringify(keyFilled));
                }
            });        
    }
    
}
