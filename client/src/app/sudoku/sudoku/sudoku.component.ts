import { Component, OnInit } from '@angular/core';
import { SudokuGameProvider } from '../sudoku.game-provider';
import { SudokuGame, CellFilled, CellHighlighted, HighlightCell, FillCell } from 'big-screen-puzzles-contract';
import { WebSocketService } from 'src/app/websocket.service';

@Component({
  selector: 'app-sudoku',
  templateUrl: './sudoku.component.html',
  styleUrls: ['./sudoku.component.scss']
})
export class SudokuComponent implements OnInit {

  public game: SudokuGame;
  public reveal = false;
  public selectedCharacter: string;

  constructor(
    private gameProvider: SudokuGameProvider,
    private webSocketService: WebSocketService
  ) { }

  public ngOnInit(): void {
    this.gameProvider.thisGame$.subscribe(g => {
      console.log("new sudoku game", g);
      this.game = (<any>g);
    });

    this.webSocketService.message$
      .subscribe(message => {
        if (message.type === "CellFilled") {
          const cellFilled = message as CellFilled;
          this.game.grid[cellFilled.x][cellFilled.y].playerValue = <number><unknown>cellFilled.value;

          // if (cellFilled.value) {
          //   this.events.unshift(`Player ${cellFilled.byPlayer.name} filled ${cellFilled.x},${cellFilled.y} with ${cellFilled.value}!`);
          // } else {
          //   this.events.unshift(`Player ${cellFilled.byPlayer.name} cleared ${cellFilled.x},${cellFilled.y}!`);
          // }
        } else if (message.type === "CellHighlighted") {
          const cellHighlighted = message as CellHighlighted;
          this.game.highlightedCells[cellHighlighted.byPlayer.id] = cellHighlighted;
          console.log("[CellHighlighted]", cellHighlighted);
        }
      });
  }

  public updateCell(x: number, y: number, event: string): void {
    const highlightCell = new HighlightCell();
    highlightCell.gameId = this.game.id;
    highlightCell.x = x;
    highlightCell.y = y;
    this.webSocketService.sendMessage(highlightCell);
    console.log("highlight cell", x, y, highlightCell);

    if (event) {
      let value: number;
      if (event.length === 1) {
        value = parseInt(event, 10);
      } else if (event.toLowerCase() === "backspace" || event.toLowerCase() === "delete" || event === 'clear') {
        value = undefined;
      } else {
        // some other weird character
        return;
      }

      if (this.game.grid[y][x].playerValue === value) {
        // same, skip
        return;
      }

      const fillCell = new FillCell();
      fillCell.gameId = this.game.id;
      fillCell.x = x;
      fillCell.y = y;
      fillCell.value = value;
      this.webSocketService.sendMessage(fillCell);

      this.game.grid[y][x].playerValue = value;
      console.log("[CellFilled]", x, y, value);
    }
  }

  public getCellBackgroundColour(x: number, y: number): string {
    if (this.game.highlightedCells) {
      const highlightedCells = Object.values(this.game.highlightedCells);
      const highlight = highlightedCells.find(h => h.x === x && h.y === y);
      if (highlight) {
        return highlight.byPlayer.colour;
      }
    }
  }

}
