import { Message } from "../messages/message";
import { Player } from "../player";

export class KeyFilled extends Message {
    public key: number;
    public value: string;
    public byPlayer: Player;

    constructor() {
        super("KeyFilled");
    }
}

export class WordHighlighted extends Message {
    public word: string;
    public byPlayer: Player;

    constructor() {
        super("WordHighlighted");
    }
}

export class FillKey extends Message {
    public gameId: string;
    public key: number;
    public value: string;

    constructor() {
        super("FillKey");
    }
}

export class HighlightWord extends Message {
    public gameId: string;
    public word: string;

    constructor() {
        super("HighlightWord");
    }
}
