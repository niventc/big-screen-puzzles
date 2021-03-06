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
  public options: Options[];
  public selectedOptions: Options;

  public games: string[] = [
    'codeword',
    'minesweeper',
    'sudoku'
  ];

  public showGames = false;
  public showJoin = false;
  public gameCode: string;

  public isHomePage = false;

  constructor(
    router: Router,
    public gameService: GameService
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

  public selectGame(game: string): void {
    this.options = this.gameService.getOptions(game);
    this.selectedOptions = this.options[0];
    this.selectedGame = game;
  }
 
  public newGame(type: string): void {
    this.gameService.newGame(type, this.selectedOptions);
  }

  public joinGame(gameCode: string): void {
    console.log("joining game", gameCode);
    this.gameService.joinGame(gameCode);
  }

}
