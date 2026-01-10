import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceSessionController } from './attendance-session.controller';
import { AttendanceSessionService } from './attendance-session.service';

describe('AttendanceSessionController', () => {
  let controller: AttendanceSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceSessionController],
      providers: [AttendanceSessionService],
    }).compile();

    controller = module.get<AttendanceSessionController>(AttendanceSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
