import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { interval, Observable, Subject } from 'rxjs';
import { map, retryWhen, tap, delay, shareReplay } from 'rxjs/operators';
import { Heartbeat, Message, Parser } from 'big-screen-puzzles-contract';

import { environment } from './../environments/environment';
import { UserService } from './user/user.service';

@Injectable()
export class WebSocketService {

  private socket$: WebSocketSubject<any>;
  public readonly message$: Observable<Message>;
  public readonly connected$ = new Subject<boolean>();

  constructor(
    userService: UserService
  ) {
    let serverUrl = `${environment.serverUrl}/api/sessions`;
    const clientId = userService.getClientId();
    if (clientId) {
      serverUrl += `?clientId=${clientId}`;
    }

    this.socket$ = webSocket(serverUrl);
    
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
            map(message => Parser.parseMessageFromObject(message) ),
            shareReplay()
        );

    this.socket$.subscribe(
        (message) => console.log(message)
    );
    
  }

  public sendMessage(message: Message): void {
    this.socket$.next(message);
  }

}