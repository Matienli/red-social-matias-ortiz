import { Controller, Get, Query } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { RangoFechasQueryDto } from './dto/rango-fechas-query.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from '../users/schemas/usuario.schema';

@Controller('estadisticas')
@Roles(PerfilUsuario.ADMINISTRADOR)
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(@Query() query: RangoFechasQueryDto) {
    return this.estadisticasService.publicacionesPorUsuario(query);
  }

  @Get('comentarios')
  comentarios(@Query() query: RangoFechasQueryDto) {
    return this.estadisticasService.comentariosEnPeriodo(query);
  }

  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(@Query() query: RangoFechasQueryDto) {
    return this.estadisticasService.comentariosPorPublicacion(query);
  }
}
