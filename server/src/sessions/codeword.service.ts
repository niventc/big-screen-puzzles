import { WordService } from 'src/words/word.service';
import { Cell } from 'big-screen-puzzles-contract';

export class CodeWordService {

    public readonly characters = new Set('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.toLowerCase().split(''));

    constructor(
        private wordService: WordService
    ) {}

    public words = new Array<string>();

    private get missingCharacters(): Array<string> {
        let letters = new Set<string>();
        this.words.forEach(w => {
            for (const l of w) {
                letters.add(l.toLowerCase());
            }
        });
        let dLetters = Array.from(letters).sort();
        
        const characters = this.characters;
        // const trickyCharacters = new Set('JKQVWXYZ'.toLowerCase().split(''));
        const missing = new Array<string>();
        characters.forEach(c => {
            if (!dLetters.includes(c))
                missing.push(c);
        });
        return missing;
    }

    private get missingPattern(): Array<string> {
        const missingCharacters = this.missingCharacters;

        return missingCharacters.length > 0 ? [`[${missingCharacters.join('')}]`] : ['[a-z]'];
    }

    public generateKey(): string[] {        
        const characters = [...this.characters];
    
        for (let i = characters.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [characters[i], characters[j]] = [characters[j], characters[i]];
        }
    
        return characters;
    }

    public generateGrid(key: Array<string>): Array<Array<Cell>> {
        let grid: Array<Array<Cell>>;
        let fullHouse = false;
        while (!fullHouse) {
            let start = new Date().getTime();
            this.words = [];

            const gridSize = 15;
            grid = [];

            let index = 0;
            while (index < gridSize) {
                grid[index] = new Array<Cell>(gridSize);
                for(let v = 0; v < grid[index].length; v++) {
                    grid[index][v] = Cell.EmptyCell();
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
                    if (!nextWord) {
                        continue;
                    }
                    nextRemaining = nextRemaining - nextWord.length;  
                    // console.log(`next word ${nextWord} of length ${nextWord.length} leaving ${nextRemaining}`);
                    if (nextRemaining !== 3) {
                        // console.log("adding word");
                        for (const letter of nextWord) {
                            grid[localX++][y].setValue(letter, key);
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
                            if (nextWord) {
                                // console.log(`adding mirror word ${nextWord}`);
                                for (const letter of nextWord) {
                                    grid[x++][y].setValue(letter, key);
                                }
                                this.words.push(nextWord);
                            }
                        }
                    });
                }

                columnIndex += 2;
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
                            if (!x) {
                                return '[a-z]{1}';
                            } else {
                                return `[${x}]{1}`;
                            }
                        });

                        const word = this.getRandomWordMatching(pattern, hoz.length);

                        if (word) {
                            // console.log(`found ${word}`);
                            for (const letter of word) {
                                try {
                                grid[x][y++].setValue(letter, key);
                                } catch (e) {
                                    console.error(e, x, y);
                                    this.prettyPrintGrid(grid);
                                    throw e;
                                }
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

            console.log("missing: " + this.missingCharacters);

            if (this.missingCharacters.length === 0) {
                fullHouse = true;
            }

            let end = new Date().getTime();

            this.prettyPrintGrid(grid);
            console.log(`Completed in ${end-start} ms`);
        }

        return grid;
    }

    private prettyPrintGrid(grid: Array<Array<Cell>>): void {
        console.log(grid.map(row => row.map(cell => cell.isEmpty ? ' ' : cell.value).join(",")).join("\r\n"));
    }

    private hasRoomForHorizontal(x: number, y: number, grid: Array<Array<Cell>>, chars: string[]): string[] {
        if (x > grid.length || y > grid.length) {
            return chars;
        }

        const cell = grid[x][y] ? grid[x][y] : undefined;        
        const cellAbove = x > 0 && y < grid.length ? grid[x - 1][y] : undefined;
        const cellBelow = x + 1 >= grid.length || y >= grid.length ? undefined : grid[x + 1][y];
        const cellBefore = y > 0 ? grid[x][y-1] : undefined;
        const nextCell = y + 1 >= grid.length ? undefined : grid[x][y + 1];
        const nextCellAndAbove = y < 1 || x + 1 >= grid.length ? undefined : grid[x + 1][y - 1];
        const nextCellAndBelow = y + 1 >= grid.length || x + 1 >= grid.length ? undefined : grid[x + 1][y + 1];
        
        if (!cell) return chars; // We've gone off grid, somehow...
        else {
            // dont want to append a word after another word
            if (cellBefore && !cellBefore.isEmpty && !cell.isEmpty) return chars;
            // cant add letter underneath a word
            if (cellAbove && !cellAbove.isEmpty && cell.isEmpty) return chars;
            // cant add letter to front of word
            if (cellBelow && !cellBelow.isEmpty && cell.isEmpty) return chars;
            // cant add letter to front of word
            if (nextCell) {
                if (nextCellAndBelow && !nextCellAndBelow.isEmpty && nextCell.isEmpty) return chars;
                if (nextCellAndAbove && !nextCellAndAbove.isEmpty && nextCell.isEmpty) return chars;
            }
        }
        
        chars.push(cell.value);
        return this.hasRoomForHorizontal(x, y + 1, grid, chars);
    }
    
    private getRandomWordMatching(pattern: string[], length: number): string {
        const limit = this.wordService.totalSize / 2;
        let match = false;
        let word = "";
        // console.log(`looking for ${pattern} less than or equal to ${length}`);
        while(!match && pattern.length > 0) {
            let patternString = pattern.join("");
            // console.log(`looking for ${pattern} less than or equal to ${length}`);
            let count = 0;
            while ((!word || word.length < 3 || !word.match(patternString) || word.match("[A-Z]") || word.length > length || this.words.includes(word)) && count <= limit) {
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

}