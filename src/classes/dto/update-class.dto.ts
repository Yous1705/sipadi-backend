import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateClassDto {
  @ApiPropertyOptional({ example: 'X-B' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @IsInt()
  year?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the class is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
