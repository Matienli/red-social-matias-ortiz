import {

  Body,

  Controller,

  Get,

  HttpCode,

  HttpStatus,

  Post,

  Request,

  UploadedFile,

  UseInterceptors,

} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { memoryStorage } from 'multer';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';

import { RegistroDto } from './dto/registro.dto';

import { Public } from './decorators/public.decorator';

import { imagenOpcionalPipe } from '../uploads/image-file.pipe';



@Controller('auth')

export class AuthController {

  constructor(private readonly authService: AuthService) {}



  @Public()

  @Post('register')

  @HttpCode(HttpStatus.CREATED)

  @UseInterceptors(

    FileInterceptor('imagenPerfil', {

      storage: memoryStorage(),

    }),

  )

  registro(

    @Body() dto: RegistroDto,

    @UploadedFile(imagenOpcionalPipe) imagenPerfil?: Express.Multer.File,

  ) {

    return this.authService.registro(dto, imagenPerfil);

  }



  @Public()

  @Post('registro')

  @HttpCode(HttpStatus.CREATED)

  @UseInterceptors(

    FileInterceptor('imagenPerfil', {

      storage: memoryStorage(),

    }),

  )

  registroAlias(

    @Body() dto: RegistroDto,

    @UploadedFile(imagenOpcionalPipe) imagenPerfil?: Express.Multer.File,

  ) {

    return this.authService.registro(dto, imagenPerfil);

  }



  @Public()

  @Post('login')

  @HttpCode(HttpStatus.OK)

  login(@Body() dto: LoginDto) {

    return this.authService.login(dto);

  }



  @Get('perfil')

  perfil(@Request() req: { user: { userId: string } }) {

    return this.authService.perfil(req.user.userId);

  }

}


