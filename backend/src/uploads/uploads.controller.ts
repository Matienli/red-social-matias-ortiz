import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadsService } from './uploads.service';
import { imagenRequeridaPipe } from './image-file.pipe';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadFile(@UploadedFile(imagenRequeridaPipe) file: Express.Multer.File) {
    const datos = await this.uploadsService.subirImagen(file);

    return {
      mensaje: 'Imagen subida a Cloudinary con éxito',
      datos,
    };
  }
}
