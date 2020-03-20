import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebSocketService } from 'src/app/websocket.service';
import { filter, first, map } from 'rxjs/operators';
import { NewGameCreated, NewGame, Cell } from 'big-screen-puzzles-contract';

@Component({
  selector: 'app-codeword',
  templateUrl: './codeword.component.html',
  styleUrls: ['./codeword.component.scss']
})
export class CodewordComponent implements OnInit {

  public characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  public key: string[] = [];

  public gridSize = 14;
  public grid: Array<Array<Cell>>;

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
        this.grid = newGameCreated.game.grid;
        this.key = newGameCreated.game.key;
        this.router.navigate(['game', newGameCreated.game.id], { relativeTo: this.route });
      });

    this.webSocketService.sendMessage(new NewGame());
  }

  public ngOnInit(): void {
    console.log(this.key);
  }

  public getKey(character: string): string {
    return (this.key.indexOf(character) + 1).toString();
  }

  public selectCharacter(character: string): void {
    this.selectedCharacter = character;
  }

  public updateCell(rowIndex: number, columnIndex: number, event: string): void {
    // this.grid[rowIndex][columnIndex] = event;
    console.log(rowIndex, columnIndex, event, this.grid);
  }

  

}
