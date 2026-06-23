import { IsString, MaxLength, MinLength } from 'class-validator';

export class CrearComentarioDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  mensaje: string;
}
