import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MinesweeperComponent } from './minesweeper.component';
import { MinesweeperRoutingModule } from './minesweeper-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [MinesweeperComponent],
  imports: [
    CommonModule,
    FormsModule,
    MinesweeperRoutingModule,
    SharedModule
  ]
})
export class MinesweeperModule { }
