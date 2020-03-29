import { Component, OnInit } from '@angular/core';
import { WebSocketService } from 'src/app/websocket.service';
import { Cell, CellFilled, FillCell, FillKey, Key, KeyFilled, HighlightWord, WordHighlighted, CodewordGame } from 'big-screen-puzzles-contract';
import { CodewordGameProvider } from '../codeword.game-provider';

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
  
  public game: CodewordGame;

  public selectedCharacter = '';

  public events = new Array<string>();

  constructor(
    private gameProvider: CodewordGameProvider,
    private webSocketService: WebSocketService
  ) {
  }

  public ngOnInit(): void {
    this.gameProvider.thisGame$.subscribe(g => {
      console.log("new codeword game", g);
      this.game = (<any>g);
    });

    this.webSocketService.message$
      .subscribe(message => {
        if (message.type === "NewGameCreated") {
          // const newGame = (<NewGameCreated>message).game;
          // if (newGame.type === "codeword") {
          //   this.game = newGame as CodewordGame;
          // }
          // this.router.navigate(['game', newGameCreated.game.id], { relativeTo: this.route });
        } else if (message.type === "PlayerJoinedGame") {
          // this.game.players.push((<PlayerJoinedGame>message).player);

          // this.events.unshift(`Player ${(<PlayerJoinedGame>message).player.name} joined the game!`);
        } else if (message.type === "JoinGameSucceeded") {
          // const game = (<JoinGameSucceeded>message).game;
          // if (game.type === "codeword") {
          //   this.game = game as CodewordGame;
          // }
        } else if (message.type === "CellFilled") {
          const cellFilled = message as CellFilled;
          this.game.grid[cellFilled.x][cellFilled.y].playerValue = cellFilled.value;

          if (cellFilled.value) {
            this.events.unshift(`Player ${cellFilled.byPlayer.name} filled ${cellFilled.x},${cellFilled.y} with ${cellFilled.value}!`);
          } else {
            this.events.unshift(`Player ${cellFilled.byPlayer.name} cleared ${cellFilled.x},${cellFilled.y}!`);
          }
        } else if (message.type === "KeyFilled") {
          const keyFilled = message as KeyFilled;
          this.game.key.find(k => k.key === keyFilled.key).playerValue = keyFilled.value;

          if (keyFilled.value) {
            this.events.unshift(`Player ${keyFilled.byPlayer.name} thinks ${keyFilled.key} is ${keyFilled.value}!`);
          } else {
            this.events.unshift(`Player ${keyFilled.byPlayer.name} cleared key ${keyFilled.key}!`);
          }          
        } else if (message.type === "WordHighlighted") {
          const wordHighlighted = message as WordHighlighted;
          this.game.highlightedWords[wordHighlighted.byPlayer.id] = wordHighlighted;
          console.log("[WordHighlighted]", wordHighlighted);
        }
      });
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
    const highlightWord = new HighlightWord();
    highlightWord.gameId = this.game.id;
    highlightWord.word = this.game.grid[rowIndex][columnIndex].words[0];
    this.webSocketService.sendMessage(highlightWord);

    if (event) {

      let value: string;
      if (event.length === 1) {
        value = event;
      } else if (event.toLowerCase() === "backspace" || event.toLowerCase() === "delete" || event === 'clear') {
        value = undefined;
      } else {
        // some other weird character
        return;
      }

      if (this.game.grid[rowIndex][columnIndex].playerValue === value) {
        // same, skip
        return;
      }

      const fillCell = new FillCell();
      fillCell.gameId = this.game.id;
      fillCell.x = rowIndex;
      fillCell.y = columnIndex;
      fillCell.value = value;
      this.webSocketService.sendMessage(fillCell);

      this.game.grid[rowIndex][columnIndex].playerValue = value;
      console.log("[CellFilled]", rowIndex, columnIndex, value);
    }
  }

  public updateKey(key: Key, event: string): void {
    if (!key.isLocked && event) {

      let value: string;
      if (event.length === 1) {
        value = event;
      } else if (event.toLowerCase() === "backspace" || event.toLowerCase() === "delete" || event === 'clear') {
        value = undefined;
      } else {
        // some other weird character
        return;
      }

      if (key.playerValue === value) {
        // samesies, do nothing
        return;
      }

      const existingKey = this.game.key.find(k => value && k.playerValue === value);
      console.log("existingkey", existingKey);
      if (existingKey) {
        // value already set to key
        this.events.unshift(`[PRIVATE] Value ${value} already set in key!`);
        return;
      }

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
