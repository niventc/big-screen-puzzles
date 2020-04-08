import { Component, OnInit } from '@angular/core';
import { Party, StartParty, PartyJoined, JoinParty, NewGameCreated, JoinGame } from 'big-screen-puzzles-contract';
import { WebSocketService } from 'src/app/websocket.service';

@Component({
  selector: 'party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.scss']
})
export class PartyComponent implements OnInit {

  public party: Party;

  public joinPartyId: string;

  constructor(
    private webSocketService: WebSocketService
  ) { }

  public ngOnInit(): void {
    this.webSocketService.message$
      .subscribe(m => {
        if (m.type === "PartyJoined") {
          this.party = (m as PartyJoined).party;
        } else if (m.type === "NewGameCreated") {
          const newGameCreated = m as NewGameCreated;
          if (newGameCreated.partyId && newGameCreated.partyId === this.party.partyId) {
            this.party.currentGame = [newGameCreated.game.type, newGameCreated.game.id];
          } 
        }
      })
  }

  public startParty(): void {
    const startParty = new StartParty();
    this.webSocketService.sendMessage(startParty);
  }

  public joinParty(): void {
    const joinParty = new JoinParty();
    joinParty.partyId = this.joinPartyId;
    this.webSocketService.sendMessage(joinParty);
  }

  public joinGame(): void {
    const joinGame = new JoinGame();
    joinGame.gameId = this.party.currentGame[1];
    this.webSocketService.sendMessage(joinGame);
  }

}
