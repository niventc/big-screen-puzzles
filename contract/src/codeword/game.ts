import { Cell } from "./cell";
import { Key } from "./key";
import { Player } from '../player';

export interface Game {
    id: string;
    grid: Array<Array<Cell>>;
    players: Array<Player>;
    key: Array<Key>;
}