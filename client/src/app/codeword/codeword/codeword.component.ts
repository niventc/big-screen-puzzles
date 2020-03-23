import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebSocketService } from 'src/app/websocket.service';
import { filter, first, map } from 'rxjs/operators';
import { NewGameCreated, NewGame, Cell, JoinGame, Game, PlayerJoinedGame, JoinGameSucceeded, CellFilled, FillCell, FillKey, Key, KeyFilled, HighlightWord, WordHighlighted, CodewordGame } from 'big-screen-puzzles-contract';

@Component({
  selector: 'app-codeword',
  templateUrl: './codeword.component.html',
  styleUrls: ['./codeword.component.scss']
})
export class CodewordComponent implements OnInit {

  public characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  public reveal = false;

  public width: number = 15;
  public height: number = 15;
  public gameId: string;
  
  public game: CodewordGame;

  public selectedCharacter = '';

  public events = new Array<string>();

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
        if (newGameCreated.game.type === "codeword") {
          this.game = newGameCreated.game as CodewordGame;
        }
        // this.router.navigate(['game', newGameCreated.game.id], { relativeTo: this.route });
      });

    const newGame = new NewGame();
    newGame.width = this.width;
    newGame.height = this.height;
    this.webSocketService.sendMessage(newGame);
  }

  public ngOnInit(): void {
    this.webSocketService.message$
      .subscribe(message => {
        if (message.type === "PlayerJoinedGame") {
          this.game.players.push((<PlayerJoinedGame>message).player);

          this.events.unshift(`Player ${(<PlayerJoinedGame>message).player.name} joined the game!`);
        } else if (message.type === "JoinGameSucceeded") {
          const game = (<JoinGameSucceeded>message).game;
          if (game.type === "codeword") {
            this.game = (<JoinGameSucceeded>message).game as CodewordGame;
          }
        } else if (message.type === "CellFilled") {
          const cellFilled = message as CellFilled;
          this.game.grid[cellFilled.x][cellFilled.y].playerValue = cellFilled.value;

          this.events.unshift(`Player ${cellFilled.byPlayer.name} filled ${cellFilled.x},${cellFilled.y} with ${cellFilled.value}!`);
        } else if (message.type === "KeyFilled") {
          const keyFilled = message as KeyFilled;
          this.game.key.find(k => k.key === keyFilled.key).playerValue = keyFilled.value;

          this.events.unshift(`Player ${keyFilled.byPlayer.name} thinks ${keyFilled.key} is ${keyFilled.value}!`);
        } else if (message.type === "WordHighlighted") {
          const wordHighlighted = message as WordHighlighted;
          this.game.highlightedWords[wordHighlighted.byPlayer.id] = wordHighlighted;
          console.log("[WordHighlighted]", wordHighlighted);
        }
      });
  }

  public joinGame(): void {
    const joinGame = new JoinGame();
    joinGame.gameId = this.gameId;
    this.webSocketService.sendMessage(joinGame);
  }

  public selectCharacter(character: string): void {
    if (character === this.selectedCharacter) {
      this.selectedCharacter = undefined;
    } else {
      this.selectedCharacter = character;
    }
  }

  public getCellBackgroundColour(cell: Cell): string {
    const highlightedWords = Object.values(this.game.highlightedWords);
    const highlight = highlightedWords.find(w => cell.words.includes(w.word));
    if (highlight) {
      return highlight.byPlayer.colour;
    }
  }

  public updateCell(rowIndex: number, columnIndex: number, event: string): void {
    if (event && event.length === 1) {
      const fillCell = new FillCell();
      fillCell.gameId = this.game.id;
      fillCell.x = rowIndex;
      fillCell.y = columnIndex;
      fillCell.value = event;
      this.webSocketService.sendMessage(fillCell);

      this.game.grid[rowIndex][columnIndex].playerValue = event;
      console.log("[CellFilled]", rowIndex, columnIndex, event);
    }

    const highlightWord = new HighlightWord();
    highlightWord.gameId = this.game.id;
    highlightWord.word = this.game.grid[rowIndex][columnIndex].words[0];
    this.webSocketService.sendMessage(highlightWord);
  }

  public updateKey(key: Key, value: string): void {
    if (!key.isLocked && value && value.length === 1) {
      const fillKey = new FillKey();
      fillKey.gameId = this.game.id;
      fillKey.key = key.key;
      fillKey.value = value;
      this.webSocketService.sendMessage(fillKey);

      key.playerValue = value;
      console.log("[KeyFilled]", key.key, key.playerValue);
    }
  }
}
