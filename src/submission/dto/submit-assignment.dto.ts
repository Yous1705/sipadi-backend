import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SubmitAssignmentDto {
  @ApiProperty({
    example: 'https://drive.google.com/file/d/xxx',
    description: 'Submission URL',
  })
  @IsString()
  url: string;
}
