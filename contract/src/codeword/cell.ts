import { Key } from "./key";

export class Cell {
    public value: string;
    public key: number;
    public playerValue: string;
    
    public isEmpty: boolean;
    public isSolved = false;

    public static EmptyCell(): Cell {
        const cell = new Cell();
        cell.isEmpty = true;
        return cell;
    }

    public setValue(value: string, key: Array<Key>): void {
        if (this.value && value != this.value) {
            throw new Error(`Cannot set cell value to ${value} as value is already set with ${this.value}`);
        }
        this.value = value;
        this.key = key.find(k => k.value === value).key;
        this.isEmpty = false;
    }
}