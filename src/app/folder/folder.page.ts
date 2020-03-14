import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Gyroscope, GyroscopeOrientation, GyroscopeOptions } from '@ionic-native/gyroscope/ngx';
import { DeviceMotion, DeviceMotionAccelerationData, DeviceMotionAccelerometerOptions } from '@ionic-native/device-motion/ngx';
// import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

import { DroneService } from '../api/drone.service';

declare type SensorsOptions = GyroscopeOptions | DeviceMotionAccelerometerOptions;

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder: string;
  public gyrosOrientation: GyroscopeOrientation;
  public acceleration: DeviceMotionAccelerationData;

  public connStatus = 'waiting connection...';
  private sendTime: number;
  public latency: number;

  public buttonStatus = '...';

  constructor(
    private activatedRoute: ActivatedRoute,
    // private screenOrientation: ScreenOrientation,
    private gyrosCtrl: Gyroscope,
    private acceleCtr: DeviceMotion,
    private droneCtrl: DroneService
  ) {
    // this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE_PRIMARY);
  }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id');
    this.startSensors();

    this.droneCtrl.connect()
      .then(() => {
        this.connStatus = 'connected!';
        this.droneCtrl.readyToSend()
          .subscribe(() => {
            // Tracking latency time
            const ackTime = Date.now();
            if (this.sendTime) { this.latency = ackTime - this.sendTime; }
            this.sendTime = ackTime;

            // Send data to drone
            this.droneCtrl.send({ g: this.gyrosOrientation, a: this.acceleration });
          });
      })
      .catch(error => this.connStatus = `Error connecting: ${error}`);
  }

  private startSensors() {
    const options: SensorsOptions = {
      frequency: 100
    };
    this.startGyroscope(options);
    this.startAccelerometer(options);
  }

  private startGyroscope(options: SensorsOptions) {
    // this.gyrosCtrl.watch(options as GyroscopeOptions)
    //   .subscribe((orientation: GyroscopeOrientation) => this.gyrosOrientation = orientation);

    setInterval(() => {
      this.gyrosOrientation = {
        x: 100, y: 100, z: 100, timestamp: Date.now()
      };
    }, options.frequency);
  }

  private startAccelerometer(options: SensorsOptions) {
    // this.acceleCtr.watchAcceleration(options as DeviceMotionAccelerometerOptions)
    //   .subscribe((acceleration: DeviceMotionAccelerationData) => this.acceleration = acceleration);

    setInterval(() => {
      this.acceleration = {
        x: 100, y: 100, z: 100, timestamp: Date.now()
      };
    }, options.frequency);
  }
}
