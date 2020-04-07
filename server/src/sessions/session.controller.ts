import * as express from 'express';
import { Router } from 'express-ws';
import { WebsocketRequestHandler } from 'express-ws';

import { WebSocketController } from 'src/server';
import { Heartbeat, Parser, JoinGame, NewGame, NewGameCreated, Game, PlayerJoinedGame, JoinGameSucceeded, FillCell, CellFilled, FillKey, KeyFilled, UpdatePlayer, PlayerUpdated, HighlightWord, WordHighlighted, SelectMinesweeperCell, MinesweeperCellSelected, MinesweeperGame, CodewordGame, Message, GameOver, MinesweeperOptions, CodewordOptions, SudokuOptions, HighlightCell, CellHighlighted, SudokuGame } from 'big-screen-puzzles-contract';
import { ClientService, WebSocketClient } from 'src/client.service';
import { WordService } from 'src/words/word.service';
import { CodeWordService } from './codeword.service';
import { MinesweeperService } from './minesweeper.service';
import { SudokuService } from './sudoku.service';
import { Database } from '@azure/cosmos';
import { GameService } from '../database/game.service';

export class SessionController implements WebSocketController {

    private path = '/api/sessions';

    private games = new Map<string, Game>();

    public gameService: GameService;

    private codeWordService: CodeWordService;
    private minesweeperService: MinesweeperService;
    private sudokuService: SudokuService;

    constructor(
        database: Database,
        private clientService: ClientService,
        wordService: WordService
    ) {
        this.gameService = new GameService(database);

        this.codeWordService = new CodeWordService(wordService);
        this.minesweeperService = new MinesweeperService();
        this.sudokuService = new SudokuService();

        this.populateCodewordTemplates();
    }

    private async populateCodewordTemplates(): Promise<void> {
        let ids = await this.gameService.getTemplateIdsFor("codeword");
        const idCount = ids.length;
        for (let i = idCount; i < 10; i++) {
            const game = this.codeWordService.generateGame({
                height: 15, 
                width: 15,
                name: "Standard"
            });
            await this.gameService.insertTemplate(game);
        }
        ids = await this.gameService.getTemplateIdsFor("codeword");
        console.log("[CodewordTemplates] Codeword Templates contains " + ids.join(", "));
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
                case SelectMinesweeperCell:
                    const selectMinesweeperCell = parsedMessaged as SelectMinesweeperCell;
                    console.log("select minesweeper cell", selectMinesweeperCell);
                    this.selectMinesweeperCell(selectMinesweeperCell, <WebSocketClient><unknown>ws);
                    break;

                // Codeword
                case NewGame:
                    const newGame = parsedMessaged as NewGame;
                    console.log("new game", newGame);
                    if (newGame.gameType === "codeword") {
                        this.newGame(newGame, <WebSocketClient><unknown>ws);
                    } else if (newGame.gameType === "minesweeper") {                        
                        this.newMinesweeperGame(newGame, <WebSocketClient><unknown>ws);
                    } else if (newGame.gameType === "sudoku") {
                        this.newSudokuGame(newGame, <WebSocketClient><unknown>ws);
                    }
                    break;
                
                case HighlightCell:
                    const highlightCell = parsedMessaged as HighlightCell;
                    console.log("highlight cell", highlightCell);
                    this.highlightCell(highlightCell, (<WebSocketClient><unknown>ws).uuid);
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

    private async updatePlayer(message: UpdatePlayer, ws: WebSocketClient): Promise<void> {
        const player = await this.clientService.updatePlayer(ws.uuid, message.name, message.colour);

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

    private async newSudokuGame(message: NewGame, ws: WebSocketClient): Promise<void> {
        const player = await this.clientService.getPlayer(ws.uuid);
        const game = this.sudokuService.generateGame(message.options as SudokuOptions);
        game.id = this.codeWordService.generateGameId();
        game.players = [player];

        this.games.set(game.id, game);

        const newGameCreated = new NewGameCreated();
        newGameCreated.game = game;
        ws.send(JSON.stringify(newGameCreated));

        const playerJoinedGame = new PlayerJoinedGame();
        playerJoinedGame.player = player;
        ws.send(JSON.stringify(playerJoinedGame));
    }

    private async newMinesweeperGame(message: NewGame, ws: WebSocketClient): Promise<void> {
        const player = await this.clientService.getPlayer(ws.uuid);
        const game = this.minesweeperService.generateGame(message.options as MinesweeperOptions);
        game.id = this.codeWordService.generateGameId();
        game.players = [player];

        this.games.set(game.id, game);

        const newGameCreated = new NewGameCreated();
        newGameCreated.game = game;
        ws.send(JSON.stringify(newGameCreated));

        const playerJoinedGame = new PlayerJoinedGame();
        playerJoinedGame.player = player;
        ws.send(JSON.stringify(playerJoinedGame));
    }

    private async selectMinesweeperCell(message: SelectMinesweeperCell, ws: WebSocketClient): Promise<void> {
        const game = this.games.get(message.gameId) as MinesweeperGame;
        const currentPlayer = await this.clientService.getPlayer(ws.uuid);

        const cell = game.grid[message.y][message.x];

        if (cell.isSelected) {
            // do nothing
            return;
        }
        
        if (message.placeFlag) {
            cell.isFlag = true;
        } else {
            cell.isSelected = true;
        }
        cell.selectedBy = currentPlayer;

        const minesweeperCellSelected = new MinesweeperCellSelected();
        minesweeperCellSelected.x = message.x;
        minesweeperCellSelected.y = message.y;
        minesweeperCellSelected.byPlayer = currentPlayer;
        minesweeperCellSelected.isFlag = message.placeFlag;

        this.sendMessageToPlayers(game, minesweeperCellSelected);

        if (!message.placeFlag) {
            if (cell.isMine) {
                const gameOver = new GameOver();
                const endTime = Date.now();
                gameOver.isSuccess = false;
                gameOver.timeTaken = endTime - game.startedAt.getTime();
                this.sendMessageToPlayers(game, gameOver);
                return;
            }  

            this.minesweeperService.getEmptyNeighbours(game.grid, message.x, message.y, currentPlayer)
                .forEach(m => {                    
                    this.sendMessageToPlayers(game, m);
                });
        }

        if (this.minesweeperService.areAllCellsSelected(game.grid)) {            
            const gameOver = new GameOver();
            const endTime = Date.now();
            gameOver.isSuccess = true;
            gameOver.timeTaken = endTime - game.startedAt.getTime();
            this.sendMessageToPlayers(game, gameOver);
            return;
        }
    }

    private async newGame(newGame: NewGame, ws: WebSocketClient): Promise<void> {
        const gameIds = await this.gameService.getTemplateIdsFor("codeword");
        const random = Math.round(Math.random() * (gameIds.length - 1));
        const gameId = gameIds[random];
        console.log("Picked " + random + " - " + gameId);
        const game = await this.gameService.getTemplate('codeword', gameId) as CodewordGame;

        // const game = this.codeWordService.generateGame(newGame.options as CodewordOptions);
        const player = await this.clientService.getPlayer(ws.uuid);
        game.players = [player];
        this.games.set(game.id, game);

        const newGameCreated = new NewGameCreated();
        newGameCreated.game = game;
        ws.send(JSON.stringify(newGameCreated));    

        const playerJoinedGame = new PlayerJoinedGame();
        playerJoinedGame.player = player;    
        ws.send(JSON.stringify(playerJoinedGame));
    }

    private async joinGame(message: JoinGame, ws: WebSocketClient): Promise<void> {
        const currentPlayer = await this.clientService.getPlayer(ws.uuid);
        const gameId = message.gameId
        const game = this.games.get(gameId);

        if (!game) {
            console.error(`No game found with id ${gameId}`);
            // TODO send error
            return;
        }

        // client might refresh and want to rejoin
        if (!game.players.find(p => p.id === ws.uuid)) {
            game.players.push(currentPlayer);            
        }

        const joinGameSucceeded = new JoinGameSucceeded();
        joinGameSucceeded.game = game;
        ws.send(JSON.stringify(joinGameSucceeded));

        const playerJoinedGame = new PlayerJoinedGame();
        playerJoinedGame.player = currentPlayer;        
        this.sendMessageToPlayers(game, playerJoinedGame);
    }

    private async highlightCell(message: HighlightCell, clientId: string): Promise<void> {
        console.log("fill cell", message);

        let game = this.games.get(message.gameId);
        if (!game) {
            console.error(`game ${message.gameId} not found!`);
            return;
        } else {
            if (game.type !== "sudoku") {
                console.error(`unable to highlight cells as ${game.type} game doesn't support it`);
                return;
            }
        }

        const player = await this.clientService.getPlayer(clientId);
        const cellHighlighted = new CellHighlighted();
        cellHighlighted.x = message.x;
        cellHighlighted.y = message.y;
        cellHighlighted.byPlayer = player;
        (<any>game).highlightedCells[clientId] = cellHighlighted;
        
        this.sendMessageToPlayers(game, cellHighlighted);    
    }

    private async fillCell(message: FillCell, clientId: string): Promise<void> {
        console.log("fill cell", message);

        const game = this.games.get(message.gameId);
        if (!game) {
            console.error(`game ${message.gameId} not found!`);
            return;
        } else {
            if (!["sudoku","codeword"].includes(game.type)) {
                console.error(`unable to fill cells as ${game.type} game doesn't support it`);
                return;
            }
        }

        (<any>game).grid[message.x][message.y].playerValue = message.value;

        const player = await this.clientService.getPlayer(clientId);
        const cellFilled = new CellFilled();
        cellFilled.x = message.x;
        cellFilled.y = message.y;
        cellFilled.value = message.value;
        cellFilled.byPlayer = player;
        
        this.sendMessageToPlayers(game, cellFilled);    
    }

    private async fillKey(message: FillKey, clientId: string): Promise<void> {
        const game = this.games.get(message.gameId) as CodewordGame;
        if (!game) {
            console.error(`game ${message.gameId} not found!`);
            return;
        }

        game.key.find(k => k.key === message.key).playerValue = message.value;

        const player = await this.clientService.getPlayer(clientId);
        const keyFilled = new KeyFilled();
        keyFilled.key = message.key;
        keyFilled.value = message.value;
        keyFilled.byPlayer = player;
        
        this.sendMessageToPlayers(game, keyFilled);    
    }

    private async highlightWord(message: HighlightWord, ws: WebSocketClient): Promise<void> {
        const game = this.games.get(message.gameId) as CodewordGame;
        if (!game) {
            console.error(`game ${message.gameId} not found!`);
            return;
        }

        const player = await this.clientService.getPlayer(ws.uuid);

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
