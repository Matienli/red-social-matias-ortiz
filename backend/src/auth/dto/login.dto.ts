import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PerfilUsuario } from '../../users/schemas/usuario.schema';

export class LoginDto {
  @IsString()
  @MinLength(3, { message: 'El identificador debe tener al menos 3 caracteres' })
  identificador: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'La contraseña debe incluir al menos una mayúscula y un número',
  })
  contrasena: string;
}
