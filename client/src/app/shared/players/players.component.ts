import { Component, OnInit, Input } from '@angular/core';
import { Player, PlayerUpdated, PlayerJoinedGame, JoinGameSucceeded, NewGameCreated, PartyJoined, JoinedParty } from 'big-screen-puzzles-contract';
import { WebSocketService } from 'src/app/websocket.service';

@Component({
  selector: 'players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.scss']
})
export class PlayersComponent implements OnInit {

  // @Input() public gameId: string;

  public playerMap = new Map<string, Player>();

  public get players(): Array<Player> {
    return Array.from(this.playerMap.values());
  }

  constructor(
    private webSocketService: WebSocketService
  ) { }

  public ngOnInit(): void {
    this.webSocketService.message$
      .subscribe(message => {

        switch (message.type) {
          case "PartyJoined":
            const partyJoined = message as PartyJoined;
            partyJoined.party.players.forEach(player => {
              console.log("adding player", player);
              this.playerMap.set(player.id, player);
            });
            break;

          case "JoinedParty":
            const joinedParty = message as JoinedParty;
            this.playerMap.set(joinedParty.player.id, joinedParty.player);
            break;

          case "JoinGameSucceeded":
            this.playerMap = new Map<string, Player>();
            const joinGameSucceeded = message as JoinGameSucceeded;
            joinGameSucceeded.game.players.forEach(player => {
              console.log("adding player", player);
              this.playerMap.set(player.id, player);
            });
            break;

          case "NewGameCreated":
            const newGameCreated = message as NewGameCreated;
            if (newGameCreated.partyId) {
              // ignore if we're in a party
              break;
            }
            this.playerMap = new Map<string, Player>();
            newGameCreated.game.players.forEach(player => {
              this.playerMap.set(player.id, player);
            });
            break;

          case "PlayerJoinedGame":
            const playerJoinedGame = message as PlayerJoinedGame;
            this.playerMap.set(playerJoinedGame.player.id, playerJoinedGame.player);
            break;

          case "PlayerUpdated":
            const playerUpdated = message as PlayerUpdated;
            if (this.playerMap.has(playerUpdated.player.id)) {
              this.playerMap.set(playerUpdated.player.id, playerUpdated.player);
            }
            break;
        }

        console.log(message, this.playerMap);
      });
  }

}
