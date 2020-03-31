import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayersComponent } from './players/players.component';
import { GameIdComponent } from './game-id/game-id.component';



@NgModule({
  declarations: [PlayersComponent, GameIdComponent],
  imports: [
    CommonModule
  ],
  exports: [
    PlayersComponent,
    GameIdComponent
  ]
})
export class SharedModule { }
