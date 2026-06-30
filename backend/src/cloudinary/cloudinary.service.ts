import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    const cloudName = this.leerConfig('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.leerConfig('CLOUDINARY_API_KEY');
    const apiSecret = this.leerConfig('CLOUDINARY_API_SECRET');

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  uploadFile(file: Express.Multer.File, folder = 'red-social'): Promise<UploadApiResponse> {
    if (!file?.buffer?.length) {
      return Promise.reject(
        new InternalServerErrorException('No se recibió el archivo de imagen en el servidor'),
      );
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) {
            const detalle = error?.message ?? 'respuesta vacía';
            console.error('Cloudinary upload error:', detalle, error);
            return reject(
              new InternalServerErrorException(
                `Error al subir imagen a Cloudinary: ${detalle}`,
              ),
            );
          }
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  private leerConfig(clave: string): string {
    const valor = this.configService.getOrThrow<string>(clave).trim().replace(/^['"]|['"]$/g, '');
    if (!valor) {
      throw new Error(`La variable ${clave} está vacía`);
    }
    return valor;
  }
}
