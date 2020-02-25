import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as io from 'socket.io-client';

const DRONE_URL = 'https://1c6481cb.ngrok.io';

@Injectable({
  providedIn: 'root'
})
export class DroneService {
  private socket;

  constructor() {
    this.socket = io(DRONE_URL);
  }

  public async connect() {
    return new Promise((resolve, reject) => {
      if (this.socket.connected) { resolve(); }
      this.socket.on('connect', () => resolve());
    });
  }

  public isConnected() { return this.socket.connected; }

  public readyToSend() {
    return new Observable(subscriber => {
      this.socket.on('sensor_data_ack', () => {
        subscriber.next();
      });
    });
  }

  public send(data) {
    console.log('::send()');

    if (this.socket.connected) {
      console.log('::send() sending...');
      this.socket.emit('sensor_data', data);
    }

  }
}
