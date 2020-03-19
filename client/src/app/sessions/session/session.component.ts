import { Component, OnInit } from '@angular/core';
import { NewGame, JoinGame } from 'big-screen-puzzles-contract';
import { WebSocketService } from 'src/app/websocket.service';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss']
})
export class SessionComponent implements OnInit {

  constructor(
    private webSocketService: WebSocketService
  ) { }

  ngOnInit() {
  }

  public newGame(): void {
    this.webSocketService.sendMessage(new NewGame());
  }

  public joinGame(): void {
    const joinGame = new JoinGame();
    joinGame.gameId = "new id";
    this.webSocketService.sendMessage(joinGame);
  }
}
