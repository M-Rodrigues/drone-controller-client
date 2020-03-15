import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as io from 'socket.io-client';

const DRONE_URL = 'http://169.254.91.185:5000';

@Injectable({
  providedIn: 'root'
})
export class DroneService {
  private socket;

  constructor() {
    this.socket = io(DRONE_URL, {secure: true});
  }

  public async connect() {
    return new Promise((resolve, reject) => {
      this.socket.on('connected', () => {
        resolve();
      });
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
    if (this.socket.connected) {
      console.log('send', data, Date.now());
      this.socket.emit('sensor_data', data);
    }
  }
}
