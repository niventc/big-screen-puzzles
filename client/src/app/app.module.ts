import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CodewordModule } from './codeword/codeword.module';
import { SessionsModule } from './sessions/sessions.module';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CodewordModule,
    SessionsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
