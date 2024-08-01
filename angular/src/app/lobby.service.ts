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
  private playerUsername: string = '';
  private opponentUsername: string = '';
  private sessionCode: string = '';
  private playerId = '';
  private host = false;
  player$ = new BehaviorSubject<IPlayer | null>(null);
  opponent$ = new BehaviorSubject<IPlayer | null>(null);
  public opponentData$ = this.opponent$.asObservable();
  session$ = new BehaviorSubject<ISession | null>(null);
  public sessionData$ = this.session$.asObservable();
  private sessionInfo: ISession | undefined;
  constructor(private socket: Socket) {}

  sub() {
    console.log('id: ' + this.playerId);
    this.socket
      .fromEvent(`lobby:${this.playerId}`)
      .pipe(map((data) => data as string))
      .subscribe((data: string) => {
        this.opponent$.next(JSON.parse(data));
        this.opponentUsername=this.opponent$.getValue()!.username;
        console.log(this.opponentUsername);
      });

    this.socket
      .fromEvent(`session:${this.playerId}`)
      .pipe(map((data) => data as string))
      .subscribe((data: string) => {
        this.session$.next(JSON.parse(data));
        var tmpSessionInfo = this.session$.getValue();
        if(tmpSessionInfo) 
        {
          this.sessionInfo=tmpSessionInfo;
          console.log(this.sessionInfo);
        }
      });
  }

  getSessionCode(): string {
    return this.sessionCode;
  }

  getPlayerUsername(): string {
    return this.playerUsername;
  }

  isHost():boolean{
    return this.host;
  }

  getSessionInfo(): ISession | null{
    if(this.sessionInfo)
      return this.sessionInfo;
    else
      return null;
  }

  getOpponentUsername(): string {
    const currentOpponent = this.opponent$.getValue();
    return currentOpponent!.username;
  }

  async joinLobby(createPlayerDto: CreatePlayerDto) {
    console.log(createPlayerDto);
    await this.socket.emit('joinLobby', createPlayerDto, (res: string[]) => {
      this.player$.next(JSON.parse(res[0]));
      this.opponent$.next(JSON.parse(res[1]));
      const opponent = this.opponent$.getValue();
      const player = this.player$.getValue();
      this.playerId = player!._id!;
      this.host=player!.isHost;
      console.log(this.host);
      this.playerUsername = player!.username;
      this.opponentUsername=opponent!.username;
      this.sessionCode = res[2];
      this.sub();
    });
  }

  async createLobby(createPlayerDto: CreatePlayerDto) {
    await this.socket.emit('createLobby', createPlayerDto, (res: string[]) => {
      this.player$.next(JSON.parse(res[0]));
      const player = this.player$.getValue();
      this.playerId = player!._id!;
      this.host=player!.isHost;
      console.log(this.host);
      this.sessionCode = res[1];
      this.playerUsername = player!.username;
      this.sub();
    });
  }

  async startGame() {
    if (this.player$.getValue()?.isHost && this.opponent$.getValue()) {
      await this.socket.emit('startGame', this.sessionCode);
    }
  }
}
