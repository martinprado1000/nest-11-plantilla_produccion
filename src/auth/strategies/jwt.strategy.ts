import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {

    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        configService: ConfigService
    ) {
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }
    
    async validate( payload: JwtPayload ): Promise<User> {
        
        const { id } = payload;

        const user = await this.userModel.findById(id);

        if ( !user ) 
            throw new UnauthorizedException('Token not valid')
            
        if ( !user.isActive )
            throw new UnauthorizedException('User is inactive, talk with an admin');

        return user;
    }

}