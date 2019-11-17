import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CodewordComponent } from './codeword/codeword.component';
import { SessionsModule } from '../sessions/sessions.module';



@NgModule({
  declarations: [CodewordComponent],
  imports: [
    CommonModule,
    FormsModule,
    SessionsModule
  ]
})
export class CodewordModule { }
