import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SeedService } from 'src/seed/seed.service';
import { SeedController } from 'src/seed/seed.controller';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({

  controllers: [SeedController],

  providers: [SeedService],

  imports:[
    ConfigModule,
    UsersModule,
    AuthModule
  ]
  
})
export class SeedModule {}
