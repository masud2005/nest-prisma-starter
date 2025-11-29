import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MainModule } from './main/main.module';
import { LibModule } from './lib/lib.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [  
    ConfigModule.forRoot({
      isGlobal: true,
    }), 
    MainModule, LibModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
