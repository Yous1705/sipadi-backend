import { IsInt, IsString, IsUrl } from 'class-validator';

export class SubmitAssignmentDto {
  @IsInt()
  assignmentId: number;

  @IsString()
  @IsUrl()
  fileUrl: string;
}
