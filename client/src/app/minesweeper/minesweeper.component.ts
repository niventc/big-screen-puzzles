import * as humanize from 'humanize-duration';

import { Component, OnInit } from '@angular/core';
import { WebSocketService } from '../websocket.service';
import { MinesweeperGame, MinesweeperCell, SelectMinesweeperCell, MinesweeperCellSelected, GameOver } from 'big-screen-puzzles-contract';
import { MinesweeperGameProvider } from './minesweeper.game-provider';

@Component({
  selector: 'app-minesweeper',
  templateUrl: './minesweeper.component.html',
  styleUrls: ['./minesweeper.component.scss']
})
export class MinesweeperComponent implements OnInit {

  public game: MinesweeperGame;
  public isGameOver = false;
  public placeFlag = false;
  public revealMines = false;

  constructor(
    private gameProvider: MinesweeperGameProvider,
    private webSocketService: WebSocketService
  ) {

  }

  public ngOnInit(): void {

    this.gameProvider.thisGame$.subscribe(g => {
      console.log("new minesweeper game", g);
      this.game = (<any>g);
      this.isGameOver = false;
    });

    this.webSocketService.message$
      .subscribe(message => {
        if (message.type === "MinesweeperCellSelected") {
          const minesweeperCellSelected = message as MinesweeperCellSelected;
          console.log("select cell", minesweeperCellSelected);
          this.game.grid[minesweeperCellSelected.y][minesweeperCellSelected.x].isSelected = true;
          this.game.grid[minesweeperCellSelected.y][minesweeperCellSelected.x].selectedBy = minesweeperCellSelected.byPlayer;
          this.game.grid[minesweeperCellSelected.y][minesweeperCellSelected.x].isFlag = minesweeperCellSelected.isFlag;
        } else if (message.type === "GameOver") {
          const gameOver = message as GameOver;
          console.log("game over", gameOver);
          if (gameOver.isSuccess) {
            alert("You won in only " + humanize(gameOver.timeTaken) + "!");
          } else {
            alert("You lost in " + humanize(gameOver.timeTaken) + "!");
          }
          this.isGameOver = true;
        }
      })
  }
  
  public selectCell(x: number, y: number, cell: MinesweeperCell): void {
    if (!this.isGameOver) {
      const selectMinesweeperCell = new SelectMinesweeperCell();
      selectMinesweeperCell.x = x;
      selectMinesweeperCell.y = y;
      selectMinesweeperCell.gameId = this.game.id;
      selectMinesweeperCell.placeFlag = this.placeFlag;
      this.webSocketService.sendMessage(selectMinesweeperCell);
    }
  }
}
