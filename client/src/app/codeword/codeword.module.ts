import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CodewordComponent } from './codeword/codeword.component';
import { SessionsModule } from '../sessions/sessions.module';
import { GameComponent } from './game/game.component';
import { CodeWordRoutingModule } from './codeword-routing.module';



@NgModule({
  declarations: [CodewordComponent, GameComponent],
  imports: [
    CommonModule,
    FormsModule,
    SessionsModule,
    CodeWordRoutingModule
  ]
})
export class CodewordModule { }
