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
import { ListarPublicacionesQueryDto } from './dto/listar-publicaciones-query.dto';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { CurrentUser, UsuarioJwtPayload } from '../auth/decorators/current-user.decorator';
import { imagenOpcionalPipe } from '../uploads/image-file.pipe';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

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

  @Get(':id')
  obtenerPorId(@Param('id') id: string, @CurrentUser() usuario: UsuarioJwtPayload) {
    return this.publicacionesService.obtenerPorId(id, usuario.userId);
  }
}
