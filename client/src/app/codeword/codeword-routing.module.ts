import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CodewordComponent } from './codeword/codeword.component';

const routes: Routes = [
  {
    path: 'codeword',
    children: [
      {
        path: ':gameId',
        component: CodewordComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CodeWordRoutingModule { }
