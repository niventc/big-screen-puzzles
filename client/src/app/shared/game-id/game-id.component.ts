import { Component, Input } from '@angular/core';

@Component({
  selector: 'game-id',
  templateUrl: './game-id.component.html',
  styleUrls: ['./game-id.component.scss']
})
export class GameIdComponent {

  @Input() public gameId: string;

}
