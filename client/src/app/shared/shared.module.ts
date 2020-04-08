import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayersComponent } from './players/players.component';
import { GameIdComponent } from './game-id/game-id.component';
import { EventsComponent } from './events/events.component';
import { EventService } from './events/event.service';
import { PartyComponent } from './party/party.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [PlayersComponent, GameIdComponent, EventsComponent, PartyComponent],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    EventsComponent,
    GameIdComponent,    
    PlayersComponent,
    PartyComponent
  ],
  providers:[
    EventService
  ]
})
export class SharedModule { }
