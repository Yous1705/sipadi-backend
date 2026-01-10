import { Module } from '@nestjs/common';
import { TeachingService } from './teaching.service';
import { TeachingController } from './teaching.controller';
import { UserModule } from 'src/user/user.module';
import { ClassesModule } from 'src/classes/classes.module';
import { TeachingRepository } from './teaching.repository';

@Module({
  imports: [UserModule, ClassesModule],
  controllers: [TeachingController],
  providers: [TeachingService, TeachingRepository],
  exports: [TeachingService, TeachingRepository],
})
export class TeachingModule {}
