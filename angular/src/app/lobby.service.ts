import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { IPlayer, ISession, Lobby } from './interfaces';
import { CreatePlayerDto } from './components/login-page/create-player.dto';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private sessionCode: string = '';
  player$ = new BehaviorSubject<IPlayer | null>(null);
  opponent$ = new BehaviorSubject<IPlayer | null>(null);
  session$ = new BehaviorSubject<ISession | null>(null);
  constructor(private socket: Socket) {}

  sub() {
    console.log('id: ' + this.player$.getValue()?._id);
    this.socket
      .fromEvent(`lobby:${this.player$.getValue()?._id}`)
      .pipe(map((data) => data as string))
      .subscribe((data: string) => {
        this.opponent$.next(JSON.parse(data));
      });

    this.socket
      .fromEvent(`session:${this.player$.getValue()?._id}`)
      .pipe(map((data) => data as string))
      .subscribe((data: string) => {
        this.session$.next(JSON.parse(data));
      });
  }

  getSessionCode(): string {
    return this.sessionCode;
  }

  async joinLobby(createPlayerDto: CreatePlayerDto) {
    console.log(createPlayerDto);
    await this.socket.emit('joinLobby', createPlayerDto, (res: string[]) => {
      this.player$.next(JSON.parse(res[0]));
      this.opponent$.next(JSON.parse(res[1]));
      this.sessionCode = res[2];
      this.sub();
    });
  }

  async createLobby(createPlayerDto: CreatePlayerDto) {
    await this.socket.emit('createLobby', createPlayerDto, (res: string[]) => {
      this.player$.next(JSON.parse(res[0]));
      this.sessionCode = res[1];
      this.sub();
    });
  }

  async startGame() {
    if (this.player$.getValue()?.isHost && this.opponent$.getValue()) {
      await this.socket.emit('startGame', this.sessionCode);
    }
  }
}
