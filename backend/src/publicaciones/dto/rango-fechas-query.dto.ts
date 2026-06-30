import { IsDateString, IsOptional } from 'class-validator';

export class RangoFechasQueryDto {
  @IsOptional()
  @IsDateString()
  desde?: string;

  @IsOptional()
  @IsDateString()
  hasta?: string;
}
