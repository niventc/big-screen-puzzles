import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class EventService {

    public events = Array<string>();

    public addEvent(event: string): void {
        this.events.unshift(event);
    }
    
}