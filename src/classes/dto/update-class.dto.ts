import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateClassDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  isActive?: boolean;
}
