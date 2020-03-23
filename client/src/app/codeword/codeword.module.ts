import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CodewordComponent } from './codeword/codeword.component';
import { SessionsModule } from '../sessions/sessions.module';
import { CodeWordRoutingModule } from './codeword-routing.module';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [CodewordComponent],
  imports: [
    CommonModule,
    FormsModule,
    SessionsModule,
    CodeWordRoutingModule,
    SharedModule
  ]
})
export class CodewordModule { }
