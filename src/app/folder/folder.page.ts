import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Gyroscope, GyroscopeOrientation, GyroscopeOptions } from '@ionic-native/gyroscope/ngx';
import { DeviceMotion, DeviceMotionAccelerationData, DeviceMotionAccelerometerOptions } from '@ionic-native/device-motion/ngx';
import { DroneService } from '../api/drone.service';

declare type SensorsOptions = GyroscopeOptions | DeviceMotionAccelerometerOptions;
declare type SensorOrientation = GyroscopeOrientation | DeviceMotionAccelerationData;

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

  constructor(
    private activatedRoute: ActivatedRoute,
    private gyrosCtrl: Gyroscope,
    private acceleCtr: DeviceMotion,
    private droneCtrl: DroneService
  ) { }

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
      frequency: 90
    };
    this.startGyroscope(options);
    this.startAccelerometer(options);
  }

  private startGyroscope(options: SensorsOptions) {
    this.gyrosCtrl.watch(options as GyroscopeOptions)
      .subscribe((orientation: GyroscopeOrientation) => this.gyrosOrientation = this.normalize(orientation));
  }

  private startAccelerometer(options: SensorsOptions) {
    this.acceleCtr.watchAcceleration(options as DeviceMotionAccelerometerOptions)
      .subscribe((acceleration: DeviceMotionAccelerationData) => this.acceleration = this.normalize(acceleration));
  }

  private normalize(vector: SensorOrientation) {
    const modulo = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2) + Math.pow(vector.z, 2));
    return vector = {
      x: vector.x / modulo,
      y: vector.y / modulo,
      z: vector.z / modulo,
      timestamp: vector.timestamp
    };
  }
}
