import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionComponent } from './session/session.component';

@NgModule({
  declarations: [SessionComponent],
  exports: [SessionComponent],
  imports: [
    CommonModule
  ]
})
export class SessionsModule { }
