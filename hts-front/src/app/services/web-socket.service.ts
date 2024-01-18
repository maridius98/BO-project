import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class WebSocketService {

  readonly url:string="ws://localhost:3000";
  socket: any;

  constructor() { 
    this.socket=io.io(this.url, {
      transports: ['websocket']
   });
    this.socket.on('connect_error', (error: any) => {
      console.error('WebSocket connection error:', error);
    });
  }

  listen(eventName: string){
    return new Observable((subscriber)=>{
      this.socket.on(eventName,(data:string)=>{
        subscriber.next(data);
      })
    })
  }

  emit(eventName: string, data: string){
    this.socket.emit(eventName,data);
  }

}
