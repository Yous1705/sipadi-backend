import { IsInt, IsString, IsUrl } from 'class-validator';

export class CreateSubmissionDto {
  @IsInt()
  studentId: number;

  @IsInt()
  assignmentId: number;

  @IsString()
  @IsUrl()
  fileUrl: string;
}
