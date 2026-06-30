import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Publicacion, PublicacionSchema } from './schemas/publicacion.schema';
import { Comentario, ComentarioSchema } from './schemas/comentario.schema';
import { PublicacionesService } from './publicaciones.service';
import { ComentariosService } from './comentarios.service';
import { PublicacionesController } from './publicaciones.controller';
import { ComentariosController } from './comentarios.controller';
import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from './estadisticas.service';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    UploadsModule,
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Comentario.name, schema: ComentarioSchema },
    ]),
  ],
  controllers: [PublicacionesController, ComentariosController, EstadisticasController],
  providers: [PublicacionesService, ComentariosService, EstadisticasService],
  exports: [PublicacionesService, ComentariosService, EstadisticasService],
})
export class PublicacionesModule {}
