import { applyDecorators, UseGuards } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from 'src/auth/guards/user-role.guard';
import { ValidRoles } from 'src/auth/interfaces';
import { RoleProtected } from 'src/auth/decorators/role-protected.decorator';

export function Auth(...roles: ValidRoles[]) {

  return applyDecorators(
    RoleProtected(...roles),
    UseGuards( AuthGuard(), UserRoleGuard ),
  );

}