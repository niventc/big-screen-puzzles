import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MinesweeperComponent } from './minesweeper.component';

const routes: Routes = [
  {
    path: 'minesweeper',
    children: [
      {
        path: ':gameId',
        component: MinesweeperComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MinesweeperRoutingModule { }
