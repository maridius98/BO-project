import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { ICard, IPlayer, ISession, Lobby } from './interfaces';
import { CreatePlayerDto } from './components/login-page/create-player.dto';
import { PlayCardDto } from './components/session-page/play-card.dto';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private sessionCode: string = '';
  player$ = new BehaviorSubject<IPlayer | null>(null);
  opponent$ = new BehaviorSubject<IPlayer | null>(null);
  session$ = new BehaviorSubject<ISession | null>(null);
  playCard$ = new BehaviorSubject<ICard | null>(null);
  constructor(private socket: Socket) {}

  sub() {
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
        console.log('Sesija:', JSON.parse(data));
      });

    this.socket
      .fromEvent(`playedCard:${this.sessionCode}`)
      .pipe(map((data) => data as string))
      .subscribe((data: string) => {
        this.playCard$.next(JSON.parse(data));
        console.log('playCard:', JSON.parse(data));
      });
  }

  getSessionCode(): string {
    return this.sessionCode;
  }

  async joinLobby(createPlayerDto: CreatePlayerDto) {
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

  async playCard(playCardDto: PlayCardDto) {
    await this.socket.emit('playCard', playCardDto);
  }

  async Roll(index: string) {
    await this.socket.emit('roll', index);
  }

  async ResolveRoll(playCardDto: PlayCardDto) {
    await this.socket.emit('resolveRoll', playCardDto);
  }

  async UseEffect(playCardDto: PlayCardDto) {
    await this.socket.emit('useEffect', playCardDto);
  }
}
