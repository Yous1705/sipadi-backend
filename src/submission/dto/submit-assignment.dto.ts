import { Type } from 'class-transformer';
import { IsInt, IsString, IsUrl } from 'class-validator';

export class SubmitAssignmentDto {
  @IsString()
  @IsUrl()
  fileUrl: string;
}
