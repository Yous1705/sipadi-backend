import { Module } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';
import { AssignmentRepository } from './assignment.repository';
import { TeachingModule } from 'src/teaching/teaching.module';

@Module({
  imports: [TeachingModule],
  controllers: [AssignmentController],
  providers: [AssignmentService, AssignmentRepository],
  exports: [AssignmentService, AssignmentRepository],
})
export class AssignmentModule {}
