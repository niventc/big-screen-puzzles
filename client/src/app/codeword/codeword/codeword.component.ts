import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebSocketService } from 'src/app/websocket.service';
import { filter, first, map } from 'rxjs/operators';
import { NewGameCreated, NewGame } from 'big-screen-puzzles-contract';

@Component({
  selector: 'app-codeword',
  templateUrl: './codeword.component.html',
  styleUrls: ['./codeword.component.scss']
})
export class CodewordComponent implements OnInit {

  public characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  public puzzle: string[][] = [
    ['H', 'E', 'L', 'L', 'O'],
    ['E', ' ', 'A', ' ', ' '],
    ['L', ' ', 'B', ' ', ' '],
    ['P', ' ', 'E', ' ', ' '],
    [' ', ' ', 'L', ' ', ' ']
  ];

  public key: string[] = [];

  public gridSize = 14;
  public grid: string[][];

  public selectedCharacter = '';

  constructor(
    private webSocketService: WebSocketService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.grid = [];
    for (let x = 0; x < this.gridSize; x++) {
      this.grid.push([]);

      for (let y = 0; y < this.gridSize; y++) {
        this.grid[x][y] = '';
      }
    }
  }

  public newGame(): void {
    this.webSocketService.message$
      .pipe(
        filter(message => message.type === "NewGameCreated"),
        first(),
        map(message => message as NewGameCreated)
      )
      .subscribe(newGameCreated => this.router.navigate(['game', newGameCreated.gameId], { relativeTo: this.route }));

    this.webSocketService.sendMessage(new NewGame());
  }

  public ngOnInit(): void {
    this.key = this.shuffleArray();

    console.log(this.key);
  }

  public getKey(character: string): string {
    return character ? this.key.indexOf(character).toString() : ' ';
  }

  public selectCharacter(character: string): void {
    this.selectedCharacter = character;
  }

  public getCell(rowIndex: number, columnIndex: number): string {
    if (this.grid[rowIndex][columnIndex]) {
      console.log(rowIndex, columnIndex, this.grid[rowIndex][columnIndex]);
    }
    return this.grid[rowIndex][columnIndex];
  }

  public updateCell(rowIndex: number, columnIndex: number, event: string): void {
    this.grid[rowIndex][columnIndex] = event;
    console.log(rowIndex, columnIndex, event, this.grid);
  }

  private shuffleArray(): string[] {
    const characters = [...this.characters];

    for (let i = characters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [characters[i], characters[j]] = [characters[j], characters[i]];
    }

    return characters;
  }

}
