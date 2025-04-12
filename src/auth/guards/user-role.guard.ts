import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs'; 
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class UserRoleGuard implements CanActivate { 
  
  constructor(
    private readonly reflector: Reflector
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    
    const validRoles: string[] = this.reflector.get( META_ROLES, context.getHandler() )
    
    if ( !validRoles ) return true;
    if ( validRoles.length === 0 ) return true;
    
    const req = context.switchToHttp().getRequest();
    const user = req.user as User;
    
    if ( !user ) 
      throw new BadRequestException('Usuario no encontrado (Request)');

    for (const role of user.roles ) {
      if ( validRoles.includes( role ) ) {
        return true;
      }
    }
    
    throw new ForbiddenException(
      `Necesita un rol válido para esta operación: [${ validRoles }]`
    );

  }
}