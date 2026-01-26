import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({ example: 'X-A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 2026 })
  @IsInt()
  year: number;
}
