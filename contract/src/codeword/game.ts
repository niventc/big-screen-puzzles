import { Cell } from "./cell";
import { Key } from "./key";
import { Word } from './word';
import { WordHighlighted } from '../messages/heartbeat';
import { Game } from '../game';

export class CodewordGame extends Game {
    public grid: Array<Array<Cell>>;
    public key: Array<Key>;
    public words: Array<Word>;
    public highlightedWords: { [key: string]: WordHighlighted };

    constructor() {
        super("codeword");
    }
}