import * as humanize from 'humanize-duration';

import { Component, OnInit } from '@angular/core';
import { WebSocketService } from '../websocket.service';
import { NewMinesweeperGame, NewGameCreated, MinesweeperOptions, MinesweeperGame, JoinGame, MinesweeperCell, SelectMinesweeperCell, MinesweeperCellSelected, JoinGameSucceeded, GameOver } from 'big-screen-puzzles-contract';

@Component({
  selector: 'app-minesweeper',
  templateUrl: './minesweeper.component.html',
  styleUrls: ['./minesweeper.component.scss']
})
export class MinesweeperComponent implements OnInit {

  public difficulties = [
    <MinesweeperOptions>{
      name: "Easy",
      numberOfMines: 10,
      width: 8,
      height: 8
    },
    <MinesweeperOptions>{
      name: "Intermediate",
      numberOfMines: 40,
      width: 16,
      height: 16
    },
    <MinesweeperOptions>{
      name: "Hard",
      numberOfMines: 99,
      width: 24,
      height: 24
    },
    <MinesweeperOptions>{
      name: "Expert",
      numberOfMines: 200,
      width: 24,
      height: 30
    }
  ];
  public selectedDifficulty: MinesweeperOptions = this.difficulties[0];

  public game: MinesweeperGame;
  public gameId: string;
  public isGameOver = false;
  public placeFlag = false;
  public revealMines = false;

  constructor(
    private webSocketService: WebSocketService
  ) {
  }

  public ngOnInit(): void {
    this.webSocketService.message$
      .subscribe(message => {
        if (message.type === "NewGameCreated") {
          const newGameCreated = message as NewGameCreated;
          console.log("[NewGameCreated]", newGameCreated);
          if (newGameCreated.game.type === "minesweeper") {
            this.game = newGameCreated.game as MinesweeperGame;
            this.isGameOver = false;
          }
          // this.router.navigate(['game', newGameCreated.game.id], { relativeTo: this.route });
        } else if (message.type === "JoinGameSucceeded") {
          const joinGame = message as JoinGameSucceeded;
          console.log("[JoinGameSucceeded]", joinGame);
          if (joinGame.game.type === "minesweeper") {
            this.game = joinGame.game as MinesweeperGame;
            this.isGameOver = false;
          }
          // this.router.navigate(['game', newGameCreated.game.id], { relativeTo: this.route });
        } else if (message.type === "MinesweeperCellSelected") {
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

  public newGame(): void {
    const newGame = new NewMinesweeperGame();
    newGame.options = this.selectedDifficulty;
    this.webSocketService.sendMessage(newGame);
  }
  
  public joinGame(): void {
    const joinGame = new JoinGame();
    joinGame.gameId = this.gameId;
    this.webSocketService.sendMessage(joinGame);
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
