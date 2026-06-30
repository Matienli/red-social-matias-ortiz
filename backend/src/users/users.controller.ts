import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CrearUsuarioAdminDto } from './dto/crear-usuario-admin.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from './schemas/usuario.schema';

@Controller('usuarios')
@Roles(PerfilUsuario.ADMINISTRADOR)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  listar() {
    return this.usersService.listarTodos();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  crear(@Body() dto: CrearUsuarioAdminDto) {
    return this.usersService.crearDesdeAdmin(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deshabilitar(@Param('id') id: string) {
    return this.usersService.deshabilitar(id);
  }

  @Post(':id/alta')
  @HttpCode(HttpStatus.OK)
  rehabilitar(@Param('id') id: string) {
    return this.usersService.rehabilitar(id);
  }
}
