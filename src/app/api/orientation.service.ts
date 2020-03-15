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

export interface IMagnitudes {
  a: AccelerometerData;
  g: GyroscopeData;
  m: MagnetometerData;
}

@Injectable({
  providedIn: 'root'
})
export class OrientationService {
  private accData: AccelerometerData;
  private gyrData: GyroscopeData;
  private magData: MagnetometerData;

  constructor(
    private gyrosCtrl: Gyroscope,
    private acceleCtr: Accelerometer,
    private magneCtrl: Magnetometer,
  ) {
    this.startReadings();
  }

  private startReadings() {
    const options: SensorsOptions = {
      frequency: READINGS_FREQUENCY_MS
    };

    this.acceleCtr.watchAcceleration(options)
      .subscribe((data: AccelerometerData) => this.accData = data);
    this.gyrosCtrl.watch(options as GyroscopeOptions)
      .subscribe((data: GyroscopeData) => this.gyrData = data);
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
}
