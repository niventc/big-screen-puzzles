import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public games: string[] = [
    'codeword',
    'minesweeper'
  ];

  public showGames = false;
  public showJoin = false;
  
  constructor() { }

  ngOnInit() {
  }

}
