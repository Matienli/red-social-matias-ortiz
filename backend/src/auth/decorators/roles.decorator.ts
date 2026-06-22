import { SetMetadata } from '@nestjs/common';
import { PerfilUsuario } from '../../users/schemas/usuario.schema';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: PerfilUsuario[]) => SetMetadata(ROLES_KEY, roles);
