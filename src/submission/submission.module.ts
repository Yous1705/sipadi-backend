import { Module } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';
import { SubmissionRepository } from './submission.repository';
import { AssignmentModule } from 'src/assignment/assignment.module';
import { ReportModule } from 'src/report/report.module';

@Module({
  imports: [AssignmentModule, ReportModule],
  controllers: [SubmissionController],
  providers: [SubmissionService, SubmissionRepository],
  exports: [SubmissionService, SubmissionRepository],
})
export class SubmissionModule {}
