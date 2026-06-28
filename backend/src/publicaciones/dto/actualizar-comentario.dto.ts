import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ActualizarComentarioDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  mensaje?: string;
}
