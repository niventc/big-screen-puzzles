import * as express from 'express';
import { Router } from 'express-ws';
import { WebsocketRequestHandler } from 'express-ws';

import { WebSocketController } from 'src/server';
import { OpenEvent } from 'ws';
import { Heartbeat, Parser, JoinGame, NewGame, NewGameCreated } from 'big-screen-puzzles-contract';
import { ClientService, WebSocketClient } from 'src/client.service';
import { WordService } from 'src/words/word.service';

export class SessionController implements WebSocketController {

    private path = '/api/sessions';

    private games = new Map<string, string[]>();

    constructor(
        private clientService: ClientService,
        private wordService: WordService
    ) {
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
                    this.games.get((<JoinGame>parsedMessaged).gameId).push((<WebSocketClient><unknown>ws).uuid);
                    this.games.get((<JoinGame>parsedMessaged).gameId).forEach(w => {
                        ws.send("{\"message\": \"someone joined\"}");
                    });
                    break;
                case NewGame:
                    console.log("new game");
                    const id = [
                        this.wordService.getRandomWord("adv"),
                        this.wordService.getRandomWord("verb"),
                        this.wordService.getRandomWord("adj"),
                        // this.wordService.getRandomWord("noun")
                    ].join("-").toLowerCase();

                    this.generateGrid();

                    this.games.set(id, []);
                    const newGameCreated = new NewGameCreated();
                    newGameCreated.gameId = id;
                    ws.send(JSON.stringify(newGameCreated));
                    break;

            }

        });
    }

    public words = new Array<string>();
    public get missingPattern(): Array<string> {
        let letters = new Set<string>();
        this.words.forEach(w => {
            for (const l of w) {
                letters.add(l.toLowerCase());
            }
        });
        let dLetters = Array.from(letters).sort();
        // console.log(dLetters, dLetters.length);
        
        const characters = new Set('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.toLowerCase().split(''));
        // const trickyCharacters = new Set('JKQVWXYZ'.toLowerCase().split(''));
        const missing = new Array<string>();
        characters.forEach(c => {
            if (!dLetters.includes(c))
                missing.push(c);
        });

        // console.log("missing " + missing);
        return missing.length > 0 ? [`[${missing.join('')}]`] : ['[a-z]'];
    }


    private generateGrid() {
        let fullHouse = false;
        while (!fullHouse) {
            let start = new Date().getTime();
            this.words = [];

        const gridSize = 15;
        const grid: Array<Array<string>> = [];

        let index = 0;
        while (index < gridSize) {
            grid[index] = new Array<string>(gridSize);
            for(let v = 0; v < grid[index].length; v++) {
                grid[index][v] = ' ';
            } 
            index++;
        }

        // Do columns
        // let words = new Array<string>();
        let columnIndices = new Array<number>();
        let columnIndex = 0;
        const midPoint = Math.round(gridSize / 2) - 1;
        while(columnIndex <= midPoint) {
            columnIndices.push(columnIndex);
            // console.log(`doing column ${columnIndex} of ${midPoint}`);
            let column = [];

            let x = 0;
            let y = columnIndex;
            let remaining = gridSize;
            let first = true;
            while (remaining > 3) {
                
                // gap or nah
                let gap = Math.round(Math.random() * 1);
                if (!first && !gap) {
                    gap = 1;
                }
                let localX = x + gap;
                let nextRemaining = remaining - gap;

                // |GAP|WORD|nextremaining|
                // |-|WORD|-------|

                if (nextRemaining < 3) {
                    remaining = 0;
                    continue;
                }

                // console.log("looking for word");
                let nextWord = this.getRandomWordMatching(this.missingPattern, nextRemaining);
                nextRemaining = nextRemaining - nextWord.length;  
                // console.log(`next word ${nextWord} of length ${nextWord.length} leaving ${nextRemaining}`);
                if (nextRemaining !== 3) {
                    // console.log("adding word");
                    for (const letter of nextWord) {
                        grid[localX++][y] = letter;
                    }
                    this.words.push(nextWord);
                    column.push(gap);
                    column.push(nextWord);
                    first = false;
                    x = localX;
                    remaining = nextRemaining;
                    // console.log("added word");
                }
            }
            column.push(remaining);

            // Mirror column
            if (columnIndex < midPoint) {
                let mirrored = column.reverse();
                x = 0;
                y = gridSize - 1 - columnIndex;
                columnIndices.push(y);
                mirrored.forEach(length => {
                    if (typeof length === "number") {
                        // console.log(`adding mirror gap ${length}`);
                        x = x + length;
                    } else {
                        let nextWord = this.getRandomWordMatching(this.missingPattern, length.length);
                        // console.log(`adding mirror word ${nextWord}`);
                        for (const letter of nextWord) {
                            grid[x++][y] = letter;
                        }
                        this.words.push(nextWord);
                    }
                });
            }

            columnIndex += this.getGap(1) + 1;
        }

        // Let's build out some horizontals
        const sortedColumns = columnIndices.sort((a, b) => a - b);
        // console.log("columns " + sortedColumns.join("|"));
        sortedColumns.forEach(column => {
            let x = 0;
            let y = column;
            while (x < gridSize) {
                const hoz = this.hasRoomForHorizontal(x, y, grid, []);

                if (hoz.length >= 3) {
                    const pattern = hoz.map(x => {
                        if (x === ' ') {
                            return '[a-z]{1}';
                        } else {
                            return `[${x}]{1}`;
                        }
                    });

                    const word = this.getRandomWordMatching(pattern, hoz.length);

                    if (word) {
                        // console.log(`found ${word}`);
                        for (const letter of word) {
                            grid[x][y++] = letter;
                        }
                        this.words.push(word);
                        y = column;
                        x++;
                    }
                }                

                x++;
            }
        });

        console.log(this.words, this.words.length);

        let letters = new Set<string>();
        this.words.forEach(w => {
            for (const l of w) {
                letters.add(l.toLowerCase());
            }
        });
        let dLetters = Array.from(letters).sort();
        // console.log(dLetters, dLetters.length);
        
        const characters = new Set('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.toLowerCase().split(''));
        const missing = new Array<string>();
        characters.forEach(c => {
            if (!dLetters.includes(c))
                missing.push(c);
        });
        console.log("missing " + missing);

        if (missing.length === 0) {
            fullHouse = true;
        }

        let end = new Date().getTime();
        console.log(`Completed in ${end-start} ms`);

        grid.forEach(row => console.log(row));
        }
    }

    private hasRoomForHorizontal(x: number, y: number, grid: Array<Array<string>>, chars: string[]): string[] {
        if (x > grid.length || y > grid.length) {
            return chars;
        }

        const cell = grid[x][y];        
        const cellAbove = x > 1 ? grid[x - 1][y] : ' ';
        const cellBelow = x + 1 >= grid.length ? ' ' : grid[x + 1][y];
        const cellBefore = y > 1 ? grid[x][y-1] : ' ';
        const nextCell = y + 1 >= grid.length ? ' ' : grid[x][y + 1];
        const nextCellAndAbove = y < 1 || x + 1 >= grid.length ? ' ' : grid[x + 1][y - 1];
        const nextCellAndBelow = y + 1 >= grid.length || x + 1 >= grid.length ? ' ' : grid[x + 1][y + 1];

        if (x + 1 > grid.length || x + 1 > grid.length) {
            chars.push(cell);
            return chars;
        }

        if (
            (cell !== ' ' && cellBefore !== ' ') || // dont want to append a word after another word
            (cell === ' ' && cellAbove !== ' ') || // cant add letter underneath a word
            (cell === ' ' && cellBelow !== ' ') || // cant add letter to front of word
            (nextCell === ' ' && (nextCellAndBelow !== ' ' || nextCellAndAbove !== ' ')) // cant add letter to front of word
        ) {
            return chars;
        } else {
            chars.push(cell);
            return this.hasRoomForHorizontal(x, y + 1, grid, chars);
        }
    }

    private getGap(of: number): number {
        return 1;
        const value = Math.round(Math.random() * of) + 1;
        console.log("got gap " + value);
        return value;
    }
    
    private getRandomWordMatching(pattern: string[], length: number): string {
        const limit = this.wordService.totalSize;
        let match = false;
        let word = "";
        // console.log(`looking for ${pattern} less than or equal to ${length}`);
        while(!match && pattern.length > 0) {
            let patternString = pattern.join("");
            // console.log(`looking for ${pattern} less than or equal to ${length}`);
            let count = 0;
            while ((!word || word.length < 3 || !word.match(patternString) || word.length > length || this.words.includes(word)) && count <= limit) {
                // console.log(`${word} does not match ${patternString}`);
                word = this.wordService.getRandomWord();
                // if (word) {
                //     word = word.toLowerCase();
                // }
                count++;
            }
            // console.log(`hit count limit, trimming pattern ${count} ${pattern}`)
            if (count >= limit) {
                word = null;
                // Always pop one
                let popped = pattern.pop();
                // console.log("dropping " + popped);
                length--;
                if (pattern.length === 0) {
                    // We done here brother
                } else {
                    // We shouldnt end on a random yet
                    popped = pattern.pop();
                    while (popped && popped.includes("a-z")) {
                        // console.log("dropping " + popped);
                        popped = pattern.pop();
                        length--;
                    }
                    if (pattern.length > 0) {
                        pattern.push(popped);
                    }
                }                
            } else {
                match = true;
            }
        }
        return word;
    }

    private getRandomWordEndingWith(char: string, length: number): string {
        let word = "";
        while (!word || word.length < 3 || !word.endsWith(char) || word.length !== length) {
            word = this.wordService.getRandomWord();
        }
        return word;
    }

    private getRandomWordStartingWith(char: string): string {
        let word = "";
        while (!word || word.length < 3 || !word.startsWith(char)) {
            word = this.wordService.getRandomWord();
        }
        return word;
    }
    
    private getRandomWordOfLength(length: number, pattern: string = null): string {
        let word = "";
        while (!word || word.length < 3 || word.length !== length || (pattern && !word.match(pattern))) {
            // console.log(`${word} does not match ${pattern}`);
            word = this.wordService.getRandomWord();
        }
        // console.log(`${word} does match ${pattern}`);
        return word;
    }

    private getWordShorterThan(length: number): string {
        console.log(`looking for word between 3 and ${length}`);
        let word = "";
        while (!word || word.length < 3 || word.length > length) {
            word = this.wordService.getRandomWord();
        }
        return word;
    }

}
