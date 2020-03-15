import { Injectable } from '@angular/core';

import {
  Gyroscope,
  GyroscopeOrientation as GyroscopeData,
  GyroscopeOptions
} from '@ionic-native/gyroscope/ngx';
import {
  DeviceMotion as Accelerometer,
  DeviceMotionAccelerationData as AccelerometerData,
  DeviceMotionAccelerometerOptions as AccelerometerOptions
} from '@ionic-native/device-motion/ngx';
import {
  Magnetometer,
  MagnetometerReading as MagnetometerData
} from '@ionic-native/magnetometer/ngx';

declare type SensorsOptions = AccelerometerOptions | GyroscopeOptions;

const READINGS_FREQUENCY_MS = 1;
const GYROS_ACC_PERCENTAGE = 0.95;

export interface IMagnitudes {
  a: AccelerometerData;
  g: GyroscopeData;
  m: MagnetometerData;
}

export interface IOrientation {
  roll: number;
  pitch: number;
  yaw: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrientationService {
  private accData: AccelerometerData;
  private gyrData: GyroscopeData;
  private magData: MagnetometerData;

  private t = 0;
  private dt: number = Date.now();

  private currOrient: IOrientation = { roll: 0, pitch: 0, yaw: 0 };

  private p: number = GYROS_ACC_PERCENTAGE;

  constructor(
    private gyrosCtrl: Gyroscope,
    private acceleCtr: Accelerometer,
    private magneCtrl: Magnetometer,
  ) {
    this.startReadings();
  }

  private startReadings(): void {
    const options: SensorsOptions = {
      frequency: READINGS_FREQUENCY_MS
    };

    this.acceleCtr.watchAcceleration(options)
      .subscribe((data: AccelerometerData) => this.accData = data);
    this.gyrosCtrl.watch(options as GyroscopeOptions)
      .subscribe((data: GyroscopeData) => {
        this.gyrData = data;

        const T = Date.now();
        this.dt = T - this.t;
        this.t = T;

        console.log('dt', this.dt);
      });
    this.magneCtrl.watchReadings()
      .subscribe((data: MagnetometerData) => this.magData = Object.assign({}, { ...data, timestamp: Date.now() }));
  }

  public getMagnitudes(): IMagnitudes {
    return {
      a: this.accData,
      g: this.gyrData,
      m: this.magData
    };
  }

  public getOrientation(): IOrientation {
    // acc roll
    const rollAcc = Math.atan(this.accData.y / this.accData.z);
    // acc pitch
    const pitchAcc = Math.atan((-1 * this.accData.x) / (this.accData.y * Math.sin(rollAcc) + this.accData.z * Math.cos(rollAcc)));

    // roll
    const roll = this.p * (this.currOrient.roll + this.gyrData.y * this.dt) + (1 - this.p) * (rollAcc);
    // pitch
    const pitch = this.p * (this.currOrient.pitch + this.gyrData.x * this.dt) + (1 - this.p) * (pitchAcc);

    // mag roll
    const rollMag = Math.atan(this.magData.y / this.magData.z);
    // mag pitch
    const pitchMag = Math.atan((-1 * this.magData.x) / (this.magData.y * Math.sin(rollMag) + this.magData.z * Math.cos(rollMag)));
    // mag yaw
    const [sRoll, cRoll, sPitch, cPitch] = [Math.sin(rollMag), Math.cos(rollMag), Math.sin(pitchMag), Math.cos(pitchMag)];
    const yaw = Math.atan((sRoll - cRoll) / (cPitch + sPitch * sRoll + sPitch * cRoll));

    console.log('[rollAcc, pitchAcc]', [rollAcc, pitchAcc]);
    console.log('[rollMag, pitchMag]', [rollMag, pitchMag, yaw]);
    console.log('[roll, pitch, yaw]', [roll, pitch, yaw]);
    console.log('[roll`, pitch`, yaw`]', [roll * 180 / Math.PI, pitch * 180 / Math.PI, yaw * 180 / Math.PI]);
    return this.currOrient = { roll, pitch, yaw };
  }
}
