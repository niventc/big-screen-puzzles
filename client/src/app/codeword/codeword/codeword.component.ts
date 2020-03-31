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
        if (message.type === "PlayerJoinedGame") {
          // this.game.players.push((<PlayerJoinedGame>message).player);

          // this.events.unshift(`Player ${(<PlayerJoinedGame>message).player.name} joined the game!`);
        } else if (message.type === "CellFilled") {
          const cellFilled = message as CellFilled;
          this.game.grid[cellFilled.x][cellFilled.y].playerValue = cellFilled.value as string;

          if (cellFilled.value) {
            this.events.unshift(`${cellFilled.byPlayer.name} placed a ${cellFilled.value}!`);
          } else {
            this.events.unshift(`${cellFilled.byPlayer.name} cleared a cell!`);
          }

          this.checkIfWordRevealed(cellFilled);
        } else if (message.type === "KeyFilled") {
          const keyFilled = message as KeyFilled;
          this.game.key.find(k => k.key === keyFilled.key).playerValue = keyFilled.value;

          if (keyFilled.value) {
            this.events.unshift(`${keyFilled.byPlayer.name} thinks ${keyFilled.key} is ${keyFilled.value}!`);
          } else {
            this.events.unshift(`${keyFilled.byPlayer.name} cleared key ${keyFilled.key}!`);
          }          
        } else if (message.type === "WordHighlighted") {
          const wordHighlighted = message as WordHighlighted;
          this.game.highlightedWords[wordHighlighted.byPlayer.id] = wordHighlighted;
          console.log("[WordHighlighted]", wordHighlighted);
        }
      });
  }

  public checkIfWordRevealed(cellFilled: CellFilled): void {
    const words = this.game.grid[cellFilled.x][cellFilled.y].words;

    for (let word of words) {
      let allLetters = true;
      for (let x = 0; x < this.game.grid.length; x++) {
        for (let y = 0; y < this.game.grid[0].length; y++) {
          const cell = this.game.grid[x][y];
          if (cell.words.includes(word) && cell.value !== cell.playerValue) {
            allLetters = false;
          }
        }
      }
      
      if (allLetters) {
        const definition = this.game.words.find(w => w.value === word);
        this.events.unshift(`${cellFilled.byPlayer.name} uncovered '${word}' which means '${definition.definition}'!`);
      }
    }
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
