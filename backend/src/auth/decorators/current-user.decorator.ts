import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UsuarioJwt {
  userId: string;
  correo: string;
  perfil: string;
}

export class UsuarioJwtPayload implements UsuarioJwt {
  userId!: string;
  correo!: string;
  perfil!: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UsuarioJwt => {
    const request = ctx.switchToHttp().getRequest<{ user: UsuarioJwt }>();
    return request.user;
  },
);
