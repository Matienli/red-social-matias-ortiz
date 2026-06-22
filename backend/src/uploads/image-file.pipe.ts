import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';

const MAX_IMAGE_SIZE = 1024 * 1024 * 5;

export const imagenOpcionalPipe = new ParseFilePipe({
  fileIsRequired: false,
  validators: [
    new MaxFileSizeValidator({ maxSize: MAX_IMAGE_SIZE }),
    new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
  ],
});

export const imagenRequeridaPipe = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: MAX_IMAGE_SIZE }),
    new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
  ],
  fileIsRequired: true,
});
