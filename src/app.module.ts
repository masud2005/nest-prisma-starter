import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MainModule } from './main/main.module';
import { LibModule } from './lib/lib.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GlobalJwtModule } from './common/jwt/jwt.module';

@Module({
  imports: [  
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GlobalJwtModule,
    MainModule, 
    LibModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
