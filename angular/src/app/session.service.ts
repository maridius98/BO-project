import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { ICard, IPlayer, IPlayerCard, ISession, Lobby } from './interfaces';
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
  challengeCardId$ = new BehaviorSubject<string>('');
  winner$ = new BehaviorSubject<string>('');
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
        console.log(JSON.parse(data));
        this.player$.next(JSON.parse(data).player);
        this.opponent$.next(JSON.parse(data).opponent);
      });

    this.socket
      .fromEvent(`playedCard:${this.sessionCode}`)
      .pipe(map((data) => data as string))
      .subscribe((data: string) => {
        this.playCard$.next(JSON.parse(data));
      });

    this.socket
      .fromEvent(`challengeCardId:${this.sessionCode}`)
      .pipe(map((data) => data as string))
      .subscribe((data: string) => this.challengeCardId$.next(data));

    this.socket
      .fromEvent(`gameFinished:${this.sessionCode}`)
      .pipe(map((data) => data as string))
      .subscribe((data: string) => {
        this.winner$.next(data);
        console.log('we have a winner!');
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

  async playCard(playCardDto: PlayCardDto): Promise<boolean> {
    return new Promise((resolve) => {
      this.socket.emit('playCard', playCardDto, (res: boolean) => {
        resolve(res);
      });
    });
  }

  async Roll(playerId: string, rollBoth = false) {
    await this.socket.emit('roll', playerId, rollBoth);
  }

  async ResolveRoll(playCardDto: PlayCardDto) {
    return new Promise((resolve) => {
      this.socket.emit('resolveRoll', playCardDto, (res: boolean) => {
        resolve(res);
      });
    });
  }

  async UseEffect(playCardDto: PlayCardDto): Promise<number> {
    return new Promise((resolve) => {
      this.socket.emit('useEffect', playCardDto, (res: number) => {
        resolve(res);
        console.log(res);
      });
    });
  }

  async Challenge(playCardDto: PlayCardDto) {
    await this.socket.emit('challenge', playCardDto);
  }

  async ResolveChallenge(playCardDto: PlayCardDto) {
    await this.socket.emit('resolveChallenge', playCardDto);
  }

  async DrawCard(playerId: string | undefined) {
    await this.socket.emit('drawCard', playerId);
  }

  async AttackMonster(playedMonsterCard: IPlayerCard | undefined) {
    await this.socket.emit('monsterAttack', playedMonsterCard);
  }

  async evaluateTurnSwap(id: string) {
    console.log('here');
    await this.socket.emit('evaluteTurnSwap', id);
  }
}
