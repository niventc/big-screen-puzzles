import { Options } from '../options';

export class MinesweeperOptions implements Options {
    name: string;
    width: number;
    height: number;
    numberOfMines: number;
}