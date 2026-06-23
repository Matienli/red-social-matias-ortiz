import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Publicacion, PublicacionSchema } from './schemas/publicacion.schema';
import { Comentario, ComentarioSchema } from './schemas/comentario.schema';
import { PublicacionesService } from './publicaciones.service';
import { ComentariosService } from './comentarios.service';
import { PublicacionesController } from './publicaciones.controller';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    UploadsModule,
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Comentario.name, schema: ComentarioSchema },
    ]),
  ],
  controllers: [PublicacionesController],
  providers: [PublicacionesService, ComentariosService],
  exports: [PublicacionesService, ComentariosService],
})
export class PublicacionesModule {}
