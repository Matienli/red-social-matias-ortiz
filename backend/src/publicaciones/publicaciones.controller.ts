import { Controller, Get } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Public()
  @Get()
  listar() {
    return this.publicacionesService.listar();
  }
}
