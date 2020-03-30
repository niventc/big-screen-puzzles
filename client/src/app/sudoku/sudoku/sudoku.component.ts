import { Component, OnInit } from '@angular/core';
import { SudokuGameProvider } from '../sudoku.game-provider';
import { SudokuGame } from 'big-screen-puzzles-contract';

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
    private gameProvider: SudokuGameProvider
  ) { }

  public ngOnInit(): void {
    this.gameProvider.thisGame$.subscribe(g => {
      console.log("new sudoku game", g);
      this.game = (<any>g);
    });
  }

  public updateCell(x, y, value): void {
    // TODO
  }

  public getCellBackgroundColour(cell): string {
    return "";
  }

}
