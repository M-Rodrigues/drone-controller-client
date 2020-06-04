import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DroneService } from '../api/drone.service';
import { OrientationService, IMagnitudes, IOrientation } from '../api/orientation.service';

import { AlertController, ToastController } from '@ionic/angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';

const MAGNITUDES_INTERVAL_MS = 1;

// tslint:disable-next-line: class-name
interface pairedlist {
  'class': number;
  'id': string;
  'address': string;
  'name': string;
}

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder: string;

  public connStatus = 'waiting...';
  private sendTime: number;
  public latency: number;

  private magnitudes: IMagnitudes = { a: undefined, g: undefined, m: undefined };
  private orientation: IOrientation = { roll: undefined, pitch: undefined, yaw: undefined };

  constructor(
    private activatedRoute: ActivatedRoute,
    private orientServ: OrientationService,
    private droneCtrl: DroneService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private bluetoothSerial: BluetoothSerial,
  ) {
    this.checkBluetoothEnabled();
    this.readMagnitudes();
    this.readOrientation();
  }

  pairedList: pairedlist;
  listToggle = false;
  pairedDeviceID = 0;
  dataSend = '';

  checkBluetoothEnabled() {
    this.bluetoothSerial.isEnabled()
    .then(success => {
      this.listPairedDevices();
    }, error => {
      this.showError('Please Enable Bluetooth');
    });
  }

  listPairedDevices() {
    this.bluetoothSerial.list().then(success => {
      this.pairedList = success;
      this.listToggle = true;
    }, error => {
      this.showError('Please Enable Bluetooth');
      this.listToggle = false;
    });
  }

  selectDevice() {
    const connectedDevice = this.pairedList[this.pairedDeviceID];
    if (!connectedDevice.address) {
      this.showError('Select Paired Device to connect');
      return;
    }
    const address = connectedDevice.address;
    const name = connectedDevice.name;

    this.connect(address);
  }

  connect(address) {
    // Attempt to connect device with specified address, call app.deviceConnected if success
    this.bluetoothSerial.connect(address).subscribe(success => {
      this.deviceConnected();
      this.showToast('Successfully Connected');
    }, error => {
      this.showError(JSON.stringify(error));
    });
  }

  deviceConnected() {
    // Subscribe to data receiving as soon as the delimiter is read
    this.bluetoothSerial.subscribe('\n').subscribe(success => {
      this.handleData(success);
      this.showToast('Connected Successfullly');
    }, error => {
      this.showError(error);
    });
  }

  deviceDisconnected() {
    // Unsubscribe from data receiving
    this.bluetoothSerial.disconnect();
    this.showToast('Device Disconnected');
  }

  handleData(data) {
    this.showToast(data);
  }

  sendData() {
    this.dataSend = JSON.stringify(this.orientation) + '\n';
    this.showToast(this.dataSend);
    this.bluetoothSerial.write(this.dataSend).then(success => {
      this.showToast(success);
    }, error => {
      this.showError(error);
    });
  }

  async showToast(msj) {
    const toast = await this.toastCtrl.create({
      message: msj,
      duration: 1000
    });
    toast.present();
  }

  async showError(error) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: error,
      buttons: ['Dismiss']
    });
    alert.present();
  }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id');

    this.droneCtrl.connect()
      .then(() => {
        this.connStatus = 'connected!';

        this.droneCtrl.readyToSend()
          .subscribe(() => {
            const ackTime = Date.now();
            if (this.sendTime) { this.latency = ackTime - this.sendTime; }
            this.sendTime = ackTime;

            this.droneCtrl.send(this.magnitudes);
          });
      });
  }

  private readMagnitudes() {
    setInterval(() => {
      this.magnitudes = this.orientServ.getMagnitudes();
    }, MAGNITUDES_INTERVAL_MS);
  }

  private readOrientation() {
    setInterval(() => {
      this.orientation = this.orientServ.getOrientation(MAGNITUDES_INTERVAL_MS);
    }, MAGNITUDES_INTERVAL_MS);
  }
}
