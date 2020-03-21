import { Component, OnInit } from '@angular/core';
import { WebSocketService } from '../websocket.service';
import { filter, map } from 'rxjs/operators';
import { PlayerConnected, Player, SetPlayerName } from 'big-screen-puzzles-contract';
import { UserService } from './user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  public player: Player = <any>{};
  public isConnected: boolean;

  constructor(
    private webSocketService: WebSocketService,
    private userService: UserService
  ) { 

  }

  public ngOnInit(): void {
    this.webSocketService.connected$
      .subscribe(connected => this.isConnected = connected);

    this.webSocketService.message$
      .pipe(
        filter(message => message.type === "PlayerConnected"),
        map(message => message as PlayerConnected)
      )
      .subscribe(playerConnected => {
        this.userService.setClientId(playerConnected.player.id);
        this.player = playerConnected.player;
      });
  }

  public changeName(): void {
    const changePlayerName = new SetPlayerName();
    changePlayerName.name = this.player.name;
    this.webSocketService.sendMessage(changePlayerName);
  }

}
