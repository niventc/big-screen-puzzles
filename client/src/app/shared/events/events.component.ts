import { Component, OnInit } from '@angular/core';
import { EventService } from './event.service';

@Component({
  selector: 'events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent {

  public events: Array<string>;

  constructor(
    eventService: EventService
  ) { 
    this.events = eventService.events;
  }

}
