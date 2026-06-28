import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { CrearComentarioDto } from './dto/crear-comentario.dto';
import { ActualizarComentarioDto } from './dto/actualizar-comentario.dto';
import { ListarComentariosQueryDto } from './dto/listar-comentarios-query.dto';
import { CurrentUser, UsuarioJwtPayload } from '../auth/decorators/current-user.decorator';

@Controller()
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Get('publicaciones/:publicacionId/comentarios')
  listar(
    @Param('publicacionId') publicacionId: string,
    @Query() query: ListarComentariosQueryDto,
  ) {
    return this.comentariosService.listarPorPublicacionPaginado(publicacionId, query);
  }

  @Post('publicaciones/:publicacionId/comentarios')
  @HttpCode(HttpStatus.CREATED)
  crear(
    @Param('publicacionId') publicacionId: string,
    @Body() dto: CrearComentarioDto,
    @CurrentUser() usuario: UsuarioJwtPayload,
  ) {
    return this.comentariosService.crear(publicacionId, usuario.userId, dto.mensaje);
  }

  @Put('comentarios/:id')
  @HttpCode(HttpStatus.OK)
  actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarComentarioDto,
    @CurrentUser() usuario: UsuarioJwtPayload,
  ) {
    return this.comentariosService.actualizar(id, usuario.userId, dto);
  }
}
