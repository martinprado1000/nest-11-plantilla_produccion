import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';

export const GetUser = createParamDecorator(
    ( data: string, ctx: ExecutionContext ) => {

        const req = ctx.switchToHttp().getRequest();

        const user = req.user.toObject ? req.user.toObject() : instanceToPlain(req.user);
        delete user.password;

        if ( !user )
            throw new InternalServerErrorException('User not found (request), This route requires an authenticated user');
        
        return ( !data ) 
            ? user 
            : user[data];
        
    }
);