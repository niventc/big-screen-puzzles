import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { interval, Observable, Subject } from 'rxjs';
import { map, retryWhen, tap, delay } from 'rxjs/operators';
import { Heartbeat, Message, Parser } from 'big-screen-puzzles-contract';

import { environment } from './../environments/environment';

@Injectable()
export class WebSocketService {

  private socket$: WebSocketSubject<any>;
  public readonly message$: Observable<Message>;
  public readonly connected$ = new Subject<boolean>();

  constructor() {
    this.socket$ = webSocket(`${environment.serverUrl}/api/sessions`);
    
    interval(1000).subscribe(() => this.socket$.next(new Heartbeat()));

    this.message$ = this.socket$
        .pipe(
            tap(() => this.connected$.next(true)),
            retryWhen(errors => {
                return errors
                    .pipe(
                        tap(error => {
                            console.error("Error talking to backend", error);
                            this.connected$.next(false)
                        }),
                        delay(1000)
                    )
            }),
            map(message => Parser.parseMessageFromObject(message) )
        );

    this.socket$.subscribe(
        (message) => console.log(message)
    );
    
  }

  public sendMessage(message: Message): void {
    this.socket$.next(message);
  }

}