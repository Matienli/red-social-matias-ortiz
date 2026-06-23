import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PublicacionesService } from './publicaciones.service';
import { ComentariosService } from './comentarios.service';
import { ListarPublicacionesQueryDto } from './dto/listar-publicaciones-query.dto';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { CrearComentarioDto } from './dto/crear-comentario.dto';
import { CurrentUser, UsuarioJwtPayload } from '../auth/decorators/current-user.decorator';
import { imagenOpcionalPipe } from '../uploads/image-file.pipe';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(
    private readonly publicacionesService: PublicacionesService,
    private readonly comentariosService: ComentariosService,
  ) {}

  @Get()
  listar(
    @Query() query: ListarPublicacionesQueryDto,
    @CurrentUser() usuario: UsuarioJwtPayload,
  ) {
    return this.publicacionesService.listar(query, usuario.userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: memoryStorage(),
    }),
  )
  crear(
    @Body() dto: CrearPublicacionDto,
    @CurrentUser() usuario: UsuarioJwtPayload,
    @UploadedFile(imagenOpcionalPipe) imagen?: Express.Multer.File,
  ) {
    return this.publicacionesService.crear(usuario.userId, dto, imagen);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async darBaja(
    @Param('id') id: string,
    @CurrentUser() usuario: UsuarioJwtPayload,
  ) {
    await this.publicacionesService.darBajaLogica(id, usuario.userId, usuario.perfil);
  }

  @Post(':id/me-gusta')
  @HttpCode(HttpStatus.OK)
  darMeGusta(@Param('id') id: string, @CurrentUser() usuario: UsuarioJwtPayload) {
    return this.publicacionesService.darMeGusta(id, usuario.userId);
  }

  @Delete(':id/me-gusta')
  @HttpCode(HttpStatus.OK)
  quitarMeGusta(@Param('id') id: string, @CurrentUser() usuario: UsuarioJwtPayload) {
    return this.publicacionesService.quitarMeGusta(id, usuario.userId);
  }

  @Get(':id/comentarios')
  listarComentarios(@Param('id') id: string) {
    return this.comentariosService.listarPorPublicacion(id);
  }

  @Post(':id/comentarios')
  @HttpCode(HttpStatus.CREATED)
  async crearComentario(
    @Param('id') id: string,
    @Body() dto: CrearComentarioDto,
    @CurrentUser() usuario: UsuarioJwtPayload,
  ) {
    await this.comentariosService.crear(id, usuario.userId, dto.mensaje);
    const comentarios = await this.comentariosService.listarPorPublicacion(id);
    return comentarios[comentarios.length - 1];
  }
}
