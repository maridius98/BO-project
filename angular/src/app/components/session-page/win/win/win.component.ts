import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SessionService } from '../../../../session.service';
import { BehaviorSubject } from 'rxjs';
import { IPlayer } from '../../../../interfaces';

@Component({
  selector: 'app-win',
  templateUrl: './win.component.html',
  styleUrl: './win.component.css',
})
export class WinComponent implements OnInit {
  parametar: string = '';
  winner$ = new BehaviorSubject<string>('');
  opponent$: BehaviorSubject<IPlayer | null>;
  player$: BehaviorSubject<IPlayer | null>;

  constructor(private sessionService: SessionService) {
    this.winner$ = sessionService.winner$;
    this.opponent$ = sessionService.opponent$;
    this.player$ = sessionService.player$;
  }
  ngOnInit() {
    this.winner$.subscribe((data) => {
      if (data != '') {
        if (this.player$.getValue()!._id !== data) {
          this.parametar = this.player$.getValue()!.username;
        } else {
          this.parametar = this.opponent$.getValue()!.username;
        }
      }
    });
  }
}
