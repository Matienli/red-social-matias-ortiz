import {
  IsEmail,
  IsEnum,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PerfilUsuario } from '../schemas/usuario.schema';

export class CrearUsuarioAdminDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  apellido: string;

  @IsEmail({}, { message: 'El correo no es válido' })
  correo: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_.]+$/, {
    message: 'El nombre de usuario solo puede contener letras, números, punto y guión bajo',
  })
  nombreUsuario: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número',
  })
  contrasena: string;

  @IsString()
  fechaNacimiento: string;

  @IsString()
  @MaxLength(200)
  descripcionBreve: string;

  @IsEnum(PerfilUsuario)
  perfil: PerfilUsuario;
}
