import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Gyroscope, GyroscopeOrientation, GyroscopeOptions } from '@ionic-native/gyroscope/ngx';
import { DeviceMotion, DeviceMotionAccelerationData, DeviceMotionAccelerometerOptions } from '@ionic-native/device-motion/ngx';
import { Magnetometer, MagnetometerReading } from '@ionic-native/magnetometer/ngx';

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
  public magnometer: MagnetometerReading;

  public connStatus = 'waiting connection...';
  private sendTime: number;
  public latency: number;

  constructor(
    private activatedRoute: ActivatedRoute,
    private gyrosCtrl: Gyroscope,
    private acceleCtr: DeviceMotion,
    private magneCtrl: Magnetometer,
    private droneCtrl: DroneService
  ) {
  }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id');
    this.startSensors();

    this.droneCtrl.connect()
      .then(() => {
        this.connStatus = 'connected!';

        setInterval(() => {
          const ackTime = Date.now();
          if (this.sendTime) { this.latency = ackTime - this.sendTime; }
          this.sendTime = ackTime;

          this.droneCtrl.send({ g: this.gyrosOrientation, a: this.acceleration });
        }, 2);
      });
  }

  private startSensors() {
    const options: SensorsOptions = {
      frequency: 1
    };
    this.startGyroscope(options);
    this.startAccelerometer(options);
    this.startMagnetometer(options);
  }

  private startGyroscope(options: SensorsOptions) {
    this.gyrosCtrl.watch(options as GyroscopeOptions)
      .subscribe((orientation: GyroscopeOrientation) => this.gyrosOrientation = orientation);
  }

  private startAccelerometer(options: SensorsOptions) {
    this.acceleCtr.watchAcceleration(options as DeviceMotionAccelerometerOptions)
      .subscribe((acceleration: DeviceMotionAccelerationData) => this.acceleration = acceleration);
  }

  private startMagnetometer(options: SensorsOptions) {
    this.magneCtrl.watchReadings()
      .subscribe((magneData: MagnetometerReading) => this.magnometer = Object.assign({}, { ...magneData, timestamp: Date.now() }));
  }
}
