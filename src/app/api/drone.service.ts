import { Injectable } from '@angular/core';
import { Observable, observable } from 'rxjs';
import * as io from 'socket.io-client';

// const DRONE_URL = 'http://169.254.91.185:5000';
// const DRONE_URL = 'http://localhost:5000';
// const DRONE_URL = 'https://3ad3899e.ngrok.io';
const DRONE_URL = 'http://192.168.137.237:5000';

@Injectable({
  providedIn: 'root'
})
export class DroneService {
  private socket;

  constructor(
    // private bluetoothCtrl: BluetoothSerial
  ) {
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
