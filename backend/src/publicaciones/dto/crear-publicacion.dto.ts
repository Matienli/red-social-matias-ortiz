import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CrearPublicacionDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  titulo: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  descripcion: string;

  @IsOptional()
  @IsUrl({}, { message: 'imagenUrl debe ser una URL válida' })
  imagenUrl?: string;
}
