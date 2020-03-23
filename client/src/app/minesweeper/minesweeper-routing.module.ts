import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MinesweeperComponent } from './minesweeper.component';

const routes: Routes = [
  {
    path: 'minesweeper',
    component: MinesweeperComponent,
    // children: [
    //   {
    //     path: 'game/:gameId',
    //     component: GameComponent
    //   }
    // ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MinesweeperRoutingModule { }
