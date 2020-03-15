import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DroneService } from '../api/drone.service';
import { OrientationService, IMagnitudes, IOrientation } from '../api/orientation.service';

const MAGNITUDES_INTERVAL_MS = 1;

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
    private droneCtrl: DroneService
  ) {
    this.readMagnitudes();
    this.readOrientation();
  }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id');

    this.droneCtrl.connect()
      .then(() => {
        this.connStatus = 'connected!';

        setInterval(() => {
          const ackTime = Date.now();
          if (this.sendTime) { this.latency = ackTime - this.sendTime; }
          this.sendTime = ackTime;

          this.droneCtrl.send(this.magnitudes);
        }, 2);
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
