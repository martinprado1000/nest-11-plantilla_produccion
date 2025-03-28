import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { AuthService } from 'src/auth/auth.service';
import { AuthController } from 'src/auth/auth.controller';

import { User, UserSchema } from 'src/users/schemas/user.schema';
import { UsersModule } from 'src/users/users.module';

@Module({

  controllers: [AuthController],

  providers: [AuthService, JwtStrategy],

  imports: [

    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    ConfigModule,

    forwardRef(() => UsersModule),

    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ ConfigModule, UsersModule ],
      inject: [ ConfigService ],
      useFactory: ( configService: ConfigService ) => {
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn:'8h'
          }
        }
      }
    })
    
  ],

  exports: [ AuthService, JwtStrategy, PassportModule, JwtModule, MongooseModule ],

})
export class AuthModule {}
