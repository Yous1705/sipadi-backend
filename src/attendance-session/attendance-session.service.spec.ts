import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceSessionService } from './attendance-session.service';

describe('AttendanceSessionService', () => {
  let service: AttendanceSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttendanceSessionService],
    }).compile();

    service = module.get<AttendanceSessionService>(AttendanceSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
