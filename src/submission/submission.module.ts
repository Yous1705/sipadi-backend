import { Module } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';
import { SubmissionRepository } from './submission.repository';
import { AssignmentModule } from 'src/assignment/assignment.module';

@Module({
  imports: [AssignmentModule],
  controllers: [SubmissionController],
  providers: [SubmissionService, SubmissionRepository],
  exports: [SubmissionService, SubmissionRepository],
})
export class SubmissionModule {}
