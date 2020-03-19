import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CodewordComponent } from './codeword/codeword.component';
import { GameComponent } from './game/game.component';

const routes: Routes = [
  {
    path: 'codeword',
    component: CodewordComponent,
    children: [
      {
        path: 'game/:gameId',
        component: GameComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CodeWordRoutingModule { }
