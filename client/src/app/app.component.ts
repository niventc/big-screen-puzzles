import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { GameService } from './game.service';
import { Options } from 'big-screen-puzzles-contract';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public selectedGame: string;
  public selectedOptions: Options;

  public games: string[] = [
    'codeword',
    'minesweeper'
  ];

  public showGames = false;
  public showJoin = false;
  public gameCode: string;

  public isHomePage = false;

  constructor(
    router: Router,
    private gameService: GameService
  ) {

    router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        if ( e.url === '/') {
          this.isHomePage = true;
        } else {
          this.isHomePage = false;
        }
      } 
    });

  }

  public getOptions(type: string): Options[] {
    const options = this.gameService.getOptions(type);
    if (!this.selectedOptions) {
      this.selectedOptions = options[0];
    }
    return options;
  }
 
  public newGame(type: string): void {
    this.gameService.newGame(type, this.selectedOptions);
  }

  public joinGame(gameCode: string): void {
    console.log("joining game", gameCode);
    this.gameService.joinGame(gameCode);
  }

}
