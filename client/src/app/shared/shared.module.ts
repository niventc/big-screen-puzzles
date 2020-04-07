import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayersComponent } from './players/players.component';
import { GameIdComponent } from './game-id/game-id.component';
import { EventsComponent } from './events/events.component';
import { EventService } from './events/event.service';

@NgModule({
  declarations: [PlayersComponent, GameIdComponent, EventsComponent],
  imports: [
    CommonModule
  ],
  exports: [
    EventsComponent,
    GameIdComponent,    
    PlayersComponent
  ],
  providers:[
    EventService
  ]
})
export class SharedModule { }
