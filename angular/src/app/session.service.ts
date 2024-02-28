import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { IPlayer, ISession } from './interfaces';
import { CreatePlayerDto } from './components/login-page/create-player.dto';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private playerUsername:string='';
  private sessionCode:string='';
  private playerId = '';
  player$ = new BehaviorSubject<IPlayer | null> (null);
  sessionData$ = new BehaviorSubject<ISession | null> (null);

  constructor(private socket: Socket) { }

  sub() {
    this.socket.fromEvent(this.playerId).pipe(map(data => data as ISession))
      .subscribe((data : ISession) => {
        this.sessionData$.next(data);
      });
  }

  getPlayerUsername():string{
    return this.playerUsername;
  }

  getSessionCode() {
    try {
      return this.sessionData$.getValue()!.code;
    } catch (ex) {
      console.log(ex, " this is probably undefined!");
      return '';
    }
  }

  async joinSession(createPlayerDto: CreatePlayerDto){
    this.playerId = await this.socket.emit('joinSession', createPlayerDto);
    this.sub();
  }

  async createSession(createPlayerDto: CreatePlayerDto){
    this.playerId = await this.socket.emit('createSession', createPlayerDto);
    
    this.sub();
  }

  async startSession() {
    if (this.player$.getValue()?.isHost) {
      await this.socket.emit('startSession', this.getSessionCode());
    }
  }
}
