import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SudokuComponent } from './sudoku/sudoku.component';
import { SudokuRoutingModule } from './sudoku-routing.module';
import { SudokuGameProvider } from './sudoku.game-provider';
import { GameProvider } from '../game.service';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [SudokuComponent],
  imports: [
    CommonModule,
    SudokuRoutingModule,
    SharedModule
  ],
  providers: [    
    SudokuGameProvider,
    { provide: GameProvider, useExisting: SudokuGameProvider, multi: true }
  ]
})
export class SudokuModule { }
