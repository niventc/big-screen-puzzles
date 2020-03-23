import { Player } from "../player";

export class MinesweeperCell {
    public isFlag: boolean;
    public isMine: boolean;
    public isSelected: boolean;
    public selectedBy: Player;
}