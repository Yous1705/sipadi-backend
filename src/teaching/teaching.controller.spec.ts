import { Test, TestingModule } from '@nestjs/testing';
import { TeachingController } from './teaching.controller';
import { TeachingService } from './teaching.service';

describe('TeachingController', () => {
  let controller: TeachingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeachingController],
      providers: [TeachingService],
    }).compile();

    controller = module.get<TeachingController>(TeachingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
