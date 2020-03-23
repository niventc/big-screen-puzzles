import * as express from 'express';
import { Router } from 'express-ws';
import { WebsocketRequestHandler } from 'express-ws';

import { WebSocketController } from 'src/server';
import { Heartbeat, Parser, JoinGame, NewGame, NewGameCreated, Game, PlayerJoinedGame, JoinGameSucceeded, FillCell, CellFilled, FillKey, KeyFilled, UpdatePlayer, PlayerUpdated, HighlightWord, WordHighlighted, NewMinesweeperGame, MinesweeperGameCreated, SelectMinesweeperCell, MinesweeperCellSelected, MinesweeperGame, CodewordGame, Message } from 'big-screen-puzzles-contract';
import { ClientService, WebSocketClient } from 'src/client.service';
import { WordService } from 'src/words/word.service';
import { CodeWordService } from './codeword.service';
import { MinesweeperService } from './minesweeper.service';

export class SessionController implements WebSocketController {

    private path = '/api/sessions';

    private games = new Map<string, Game>();

    private codeWordService: CodeWordService;
    private minesweeperService: MinesweeperService;

    constructor(
        private clientService: ClientService,
        wordService: WordService
    ) {
        this.codeWordService = new CodeWordService(wordService);
        this.minesweeperService = new MinesweeperService();
    }

    public setup(router: Router): void {
        router.ws(this.path, this.onWebSocket);
    }

    public onWebSocket: WebsocketRequestHandler = (ws, req, next) => {
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

                case UpdatePlayer:
                    const updatePlayer = parsedMessaged as UpdatePlayer;
                    console.log("update player", updatePlayer);
                    this.updatePlayer(updatePlayer, <WebSocketClient><unknown>ws);
                    break;

                case JoinGame:
                    const joinGame = parsedMessaged as JoinGame;
                    console.log("join game", joinGame);
                    this.joinGame(joinGame, <WebSocketClient><unknown>ws);
                    break;

                // Minesweeper
                case NewMinesweeperGame:
                    const newMinesweeperGame = parsedMessaged as NewMinesweeperGame;
                    console.log("new minesweeper game", newMinesweeperGame);
                    this.newMinesweeperGame(newMinesweeperGame, <WebSocketClient><unknown>ws);
                    break;

                case SelectMinesweeperCell:
                    const selectMinesweeperCell = parsedMessaged as SelectMinesweeperCell;
                    console.log("select minesweeper cell", selectMinesweeperCell);
                    this.selectMinesweeperCell(selectMinesweeperCell, <WebSocketClient><unknown>ws);
                    break;


                // Codeword
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

                case HighlightWord:
                    const highlightWord = parsedMessaged as HighlightWord;
                    console.log("highlight word", highlightWord);
                    this.highlightWord(highlightWord, <WebSocketClient><unknown>ws);
                    break;

            }

        });
    }

    private updatePlayer(message: UpdatePlayer, ws: WebSocketClient): void {
        const player = this.clientService.updatePlayer(ws.uuid, message.name, message.colour);

        // Update all games the player is in, and notify other players
        Array.from(this.games.values())
            .filter(game => game.players.find(player => player.id === ws.uuid) !== null)
            .forEach(game => {
                let gamePlayer = game.players.find(player => player.id === ws.uuid);
                if (gamePlayer) {
                    gamePlayer.name = message.name;

                    const playerUpdated = new PlayerUpdated();
                    playerUpdated.player = player;
                    
                    this.sendMessageToPlayers(game, playerUpdated);
                }
            });
    }

    private newMinesweeperGame(message: NewMinesweeperGame, ws: WebSocketClient): void {
        const player = this.clientService.getPlayer(ws.uuid);
        const game = this.minesweeperService.generateGame(message.options);
        game.id = this.codeWordService.generateGameId();
        game.players = [player];

        this.games.set(game.id, game);

        const newGameCreated = new NewGameCreated();;
        newGameCreated.game = game;
        ws.send(JSON.stringify(newGameCreated));

        const playerJoinedGame = new PlayerJoinedGame();
        playerJoinedGame.player = player;
        ws.send(JSON.stringify(playerJoinedGame));
    }

    private selectMinesweeperCell(message: SelectMinesweeperCell, ws: WebSocketClient): void {
        const game = this.games.get(message.gameId) as MinesweeperGame;
        const currentPlayer = this.clientService.getPlayer(ws.uuid);

        if (message.placeFlag) {
            game.grid[message.y][message.x].isFlag = true;
        } else {
            game.grid[message.y][message.x].isSelected = true;
        }
        game.grid[message.y][message.x].selectedBy = currentPlayer;

        const minesweeperCellSelected = new MinesweeperCellSelected();
        minesweeperCellSelected.x = message.x;
        minesweeperCellSelected.y = message.y;
        minesweeperCellSelected.byPlayer = currentPlayer;
        minesweeperCellSelected.isFlag = message.placeFlag;

        this.sendMessageToPlayers(game, minesweeperCellSelected);
    }

    private newGame(newGame: NewGame, ws: WebSocketClient): void {
        const game = this.codeWordService.generateGame(newGame.width, newGame.height);
        const player = this.clientService.getPlayer(ws.uuid);
        game.players = [player];
        this.games.set(game.id, game);

        const newGameCreated = new NewGameCreated();
        newGameCreated.game = game;
        ws.send(JSON.stringify(newGameCreated));    

        const playerJoinedGame = new PlayerJoinedGame();
        playerJoinedGame.player = player;    
        ws.send(JSON.stringify(playerJoinedGame));
    }

    private joinGame(message: JoinGame, ws: WebSocketClient): void {
        const currentPlayer = this.clientService.getPlayer(ws.uuid);
        const gameId = message.gameId
        const game = this.games.get(gameId);

        if (!game) {
            console.error(`No game found with id ${gameId}`);
            // TODO send error
            return;
        }

        if (game.players.find(p => p.id === ws.uuid)) {
            console.warn(`Player already part of game with id ${gameId}`);
            return;
        }

        game.players.push(currentPlayer);

        const joinGameSucceeded = new JoinGameSucceeded();
        joinGameSucceeded.game = game;
        ws.send(JSON.stringify(joinGameSucceeded));

        const playerJoinedGame = new PlayerJoinedGame();
        playerJoinedGame.player = currentPlayer;        
        this.sendMessageToPlayers(game, playerJoinedGame);
    }

    private fillCell(message: FillCell, clientId: string): void {
        console.log("fill cell", message);

        const game = this.games.get(message.gameId) as CodewordGame;
        if (!game) {
            console.error(`game ${message.gameId} not found!`);
            return;
        }

        game.grid[message.x][message.y].playerValue = message.value;

        const player = this.clientService.getPlayer(clientId);
        const cellFilled = new CellFilled();
        cellFilled.x = message.x;
        cellFilled.y = message.y;
        cellFilled.value = message.value;
        cellFilled.byPlayer = player;
        
        this.sendMessageToPlayers(game, cellFilled);    
    }

    private fillKey(message: FillKey, clientId: string): void {
        const game = this.games.get(message.gameId) as CodewordGame;
        if (!game) {
            console.error(`game ${message.gameId} not found!`);
            return;
        }

        game.key.find(k => k.key === message.key).playerValue = message.value;

        const player = this.clientService.getPlayer(clientId);
        const keyFilled = new KeyFilled();
        keyFilled.key = message.key;
        keyFilled.value = message.value;
        keyFilled.byPlayer = player;
        
        this.sendMessageToPlayers(game, keyFilled);    
    }

    private highlightWord(message: HighlightWord, ws: WebSocketClient): void {
        const game = this.games.get(message.gameId) as CodewordGame;
        if (!game) {
            console.error(`game ${message.gameId} not found!`);
            return;
        }

        const player = this.clientService.getPlayer(ws.uuid);

        const wordHighlighted = new WordHighlighted();
        wordHighlighted.word = message.word;
        wordHighlighted.byPlayer = player;
        game.highlightedWords[ws.uuid] = wordHighlighted;

        this.sendMessageToPlayers(game, wordHighlighted);
    }
    

    private sendMessageToPlayers(game: Game, message: Message): void {
        game.players
            .forEach(player => {
                const client = this.clientService.getClient(player.id);
                if (!client) {
                    console.warn(`Unable to find client with id ${player.id}`);
                    // TODO error/remove from game
                } else if(client.readyState === client.CLOSED) {
                    console.warn(`Client with id ${player.id} is closed`);
                } else {
                    console.log(`Sending to ${player.id}`, message);
                    client.send(JSON.stringify(message));
                }
            });
    }
}
