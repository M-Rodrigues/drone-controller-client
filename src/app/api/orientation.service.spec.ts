import { TestBed } from '@angular/core/testing';

import { OrientationService } from './orientation.service';

describe('OrientationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrientationService = TestBed.get(OrientationService);
    expect(service).toBeTruthy();
  });
});
