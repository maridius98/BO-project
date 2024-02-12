import { Injectable, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { CreatePlayerDto } from './session-page/create-player.dto';
import { BehaviorSubject, Observable } from 'rxjs';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SessionService implements OnInit {
  private sessionDataSubject = new BehaviorSubject<any>(null);
  sessionData$: Observable<any> = this.sessionDataSubject.asObservable();
  
  constructor(private socket: Socket) { }

  ngOnInit(){
    console.log("something");
    this.socket.fromEvent('joinedSession').pipe(map(data => data))
      .subscribe((sessionData: any) => {
        this.sessionDataSubject.next(sessionData);
      });
  }

  joinSession(createPlayerDto: CreatePlayerDto){
    this.socket.emit('createSession', createPlayerDto);
  }

  createSession(createPlayerDto: CreatePlayerDto){
    this.socket.emit('joinSession', createPlayerDto);
  }

  getMessage() {
    return this.socket.fromEvent('message').pipe(map(data => data));
  }
}
