import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-codeword',
  templateUrl: './codeword.component.html',
  styleUrls: ['./codeword.component.scss']
})
export class CodewordComponent implements OnInit {

  public characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  public puzzle: string[][] = [
    ['H', 'E', 'L', 'L', 'O'],
    ['E', ' ', 'A', ' ', ' '],
    ['L', ' ', 'B', ' ', ' '],
    ['P', ' ', 'E', ' ', ' '],
    [' ', ' ', 'L', ' ', ' ']
  ];

  public key: Map<string, number> = new Map();

  constructor() { }

  public ngOnInit(): void {
    const key = this.shuffleArray();

    key.forEach((v, i) => {
      this.key.set(v, i + 1);
    });

    console.log(this.key);
  }

  public getKey(character: string): number {
    return this.key.get(character);
  }

  private shuffleArray(): string[] {
    const characters = this.characters.split('');

    for (let i = characters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [characters[i], characters[j]] = [characters[j], characters[i]];
    }

    return characters;

  }

}
