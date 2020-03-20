import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebSocketService } from 'src/app/websocket.service';
import { filter, first, map } from 'rxjs/operators';
import { NewGameCreated, NewGame, Cell, JoinGame, Game, PlayerJoinedGame, JoinGameSucceeded } from 'big-screen-puzzles-contract';

@Component({
  selector: 'app-codeword',
  templateUrl: './codeword.component.html',
  styleUrls: ['./codeword.component.scss']
})
export class CodewordComponent implements OnInit {

  public characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  public gameId: string;

  public gridSize = 14;
  public game: Game;

  public selectedCharacter = '';

  constructor(
    private webSocketService: WebSocketService,
    private router: Router,
    private route: ActivatedRoute
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
        this.game = newGameCreated.game;
        this.router.navigate(['game', newGameCreated.game.id], { relativeTo: this.route });
      });

    this.webSocketService.sendMessage(new NewGame());
  }

  public ngOnInit(): void {
    this.webSocketService.message$
      .subscribe(message => {
        if (message.type === "PlayerJoinedGame") {
          this.game.players.push((<PlayerJoinedGame>message).clientId);
        } else if (message.type === "JoinGameSucceeded") {
          this.game = (<JoinGameSucceeded>message).game;
        }
      });
  }

  public getKey(character: string): string {
    return (this.game.key.indexOf(character) + 1).toString();
  }

  public joinGame(): void {
    const joinGame = new JoinGame();
    joinGame.gameId = this.gameId;
    this.webSocketService.sendMessage(joinGame);
  }

  public selectCharacter(character: string): void {
    this.selectedCharacter = character;
  }

  public updateCell(rowIndex: number, columnIndex: number, event: string): void {
    // this.grid[rowIndex][columnIndex] = event;
    console.log(rowIndex, columnIndex, event, this.game.grid);
  }

  

}
