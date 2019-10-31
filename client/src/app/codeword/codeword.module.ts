import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CodewordComponent } from './codeword/codeword.component';



@NgModule({
  declarations: [CodewordComponent],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class CodewordModule { }
