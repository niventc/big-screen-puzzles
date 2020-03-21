import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CodewordModule } from './codeword/codeword.module';
import { SessionsModule } from './sessions/sessions.module';
import { HomeComponent } from './home/home.component';
import { WebSocketService } from './websocket.service';
import { UserComponent } from './user/user.component';
import { UserService } from './user/user.service';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    UserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CodewordModule,
    SessionsModule
  ],
  providers: [
    WebSocketService,
    UserService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
