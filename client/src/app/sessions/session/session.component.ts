import { Component, OnInit } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss']
})
export class SessionComponent implements OnInit {

  private socket$: WebSocketSubject<string>;

  constructor() { }

  ngOnInit() {
    this.socket$ = webSocket('ws://localhost:3000/api/sessions');
  
    this.socket$.subscribe(
      (message) => console.log(message)
    );
  }

  public sendMessage(): void {
    console.log("sending");
    this.socket$.next("hello!");
  }

}
