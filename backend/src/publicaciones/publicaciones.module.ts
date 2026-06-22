import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Publicacion, PublicacionSchema } from './schemas/publicacion.schema';
import { PublicacionesService } from './publicaciones.service';
import { PublicacionesController } from './publicaciones.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
    ]),
  ],
  controllers: [PublicacionesController],
  providers: [PublicacionesService],
  exports: [PublicacionesService],
})
export class PublicacionesModule {}
