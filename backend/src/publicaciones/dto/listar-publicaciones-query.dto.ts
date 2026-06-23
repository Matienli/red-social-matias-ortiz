import { IsIn, IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListarPublicacionesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @IsOptional()
  @IsIn(['fecha', 'me-gusta'])
  orden?: 'fecha' | 'me-gusta' = 'fecha';

  @IsOptional()
  @IsMongoId({ message: 'usuarioId debe ser un id de MongoDB válido' })
  usuarioId?: string;
}
