import { Injectable, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { CreatePlayerDto } from './login-page/create-player.dto';
import { BehaviorSubject, Observable } from 'rxjs';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SessionService implements OnInit {
  private sessionDataSubject = new BehaviorSubject<any>(null);
  private playerUsername:string='';
  private sessionCode:string='';

  sessionData$: Observable<any> = this.sessionDataSubject.asObservable();

  constructor(private socket: Socket) { }

  ngOnInit(){
    this.socket.fromEvent('joinedSession').pipe(map(data => data))
      .subscribe((sessionData: any) => {
        this.sessionDataSubject.next(sessionData);
      });
  }

  getPlayerUsername():string{
    return this.playerUsername;
  }

  getSessionCode():string{
    return this.sessionCode;
  }

  joinSession(createPlayerDto: CreatePlayerDto){
    this.socket.emit('joinSession', createPlayerDto);
    if(createPlayerDto.username)this.playerUsername=createPlayerDto.username;
  }

  createSession(createPlayerDto: CreatePlayerDto){
    this.socket.emit('createSession', createPlayerDto);
    this.socket.fromEvent('createdSession').subscribe((data: any) => {
      console.log(data);
      this.playerUsername = data.username;
      this.sessionCode = data.session;
    });
  }

  getMessage() {
    return this.socket.fromEvent('message').pipe(map(data => data));
  }
}
