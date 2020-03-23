import { Component, OnInit } from '@angular/core';
import { WebSocketService } from '../websocket.service';
import { filter, first, map } from 'rxjs/operators';
import { NewMinesweeperGame, NewGameCreated, MinesweeperOptions, MinesweeperGame, JoinGame } from 'big-screen-puzzles-contract';

@Component({
  selector: 'app-minesweeper',
  templateUrl: './minesweeper.component.html',
  styleUrls: ['./minesweeper.component.scss']
})
export class MinesweeperComponent {

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

  public selectedOptions: MinesweeperOptions = this.difficulties[0];

  public game: MinesweeperGame;
  public gameId: string;

  constructor(
    private webSocketService: WebSocketService
  ) {
  }

  public newGame(): void {
    this.webSocketService.message$
      .pipe(
        filter(message => message.type === "NewGameCreated"),
        first(),
        map(message => message as NewGameCreated)
      )
      .subscribe(newGameCreated => {
        console.log("[NewGameCreated]", newGameCreated);
        if (newGameCreated.game.type === "minesweeper") {
          this.game = newGameCreated.game as MinesweeperGame;
        }
        // this.router.navigate(['game', newGameCreated.game.id], { relativeTo: this.route });
      });

    const newGame = new NewMinesweeperGame();
    newGame.options = this.selectedOptions;
    this.webSocketService.sendMessage(newGame);
  }
  
  public joinGame(): void {
    const joinGame = new JoinGame();
    joinGame.gameId = this.gameId;
    this.webSocketService.sendMessage(joinGame);
  }

}
