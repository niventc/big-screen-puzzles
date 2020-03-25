import { Cell } from "./cell";
import { Key } from "./key";
import { Word } from './word';
import { Game } from '../game';
import { WordHighlighted } from "./messages";

export class CodewordGame extends Game {
    public grid: Array<Array<Cell>>;
    public key: Array<Key>;
    public words: Array<Word>;
    public highlightedWords: { [key: string]: WordHighlighted };

    constructor() {
        super("codeword");
    }
}
