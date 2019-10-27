import { NgModule } from '@angular/core';
import { Routes, RouterModule, Route } from '@angular/router';
import { CodewordComponent } from './codeword/codeword/codeword.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'codeword',
    component: CodewordComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
