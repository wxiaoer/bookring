import { TestBed } from '@angular/core/testing';

import { BookringService } from './bookring.service';

describe('BookringService', () => {
  let service: BookringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
