import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MinesweeperComponent } from './minesweeper.component';
import { MinesweeperRoutingModule } from './minesweeper-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { MinesweeperGameProvider } from './minesweeper.game-provider';
import { GameProvider } from '../game.service';

@NgModule({
  declarations: [
    MinesweeperComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MinesweeperRoutingModule,
    SharedModule
  ],
  providers: [
    MinesweeperGameProvider,
    { provide: GameProvider, useExisting: MinesweeperGameProvider, multi: true }
  ]
})
export class MinesweeperModule { }
