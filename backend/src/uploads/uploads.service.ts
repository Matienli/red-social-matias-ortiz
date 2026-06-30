import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

export interface ImagenSubida {
  url: string;
  publicId: string;
  formato: string;
}

@Injectable()
export class UploadsService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async subirImagen(
    archivo: Express.Multer.File,
    carpeta = 'red-social',
  ): Promise<ImagenSubida> {
    try {
      const resultado = await this.cloudinaryService.uploadFile(archivo, carpeta);

      return {
        url: resultado.secure_url,
        publicId: resultado.public_id,
        formato: resultado.format ?? '',
      };
    } catch (error) {
      console.error('Error al subir imagen:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Falló la subida de la imagen a Cloudinary');
    }
  }

  subirImagenPerfil(archivo: Express.Multer.File): Promise<ImagenSubida> {
    return this.subirImagen(archivo, 'red-social/perfiles');
  }
}
