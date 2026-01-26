import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSubjectDto {
  @ApiPropertyOptional({
    example: 'Advanced Mathematics',
    description: 'Updated subject name',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
