import { Component, OnInit } from '@angular/core';
import { WebSocketService } from '../websocket.service';
import { filter, map } from 'rxjs/operators';
import { ClientConnected } from 'big-screen-puzzles-contract';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  public clientId: string;
  public isConnected: boolean;

  constructor(
    private webSocketService: WebSocketService
  ) { }

  public ngOnInit(): void {
    this.webSocketService.connected$
      .subscribe(connected => this.isConnected = connected);

    this.webSocketService.message$
      .pipe(
        filter(message => message.type === "ClientConnected"),
        map(message => message as ClientConnected)
      )
      .subscribe(client => this.clientId = client.clientId);
  }

}
