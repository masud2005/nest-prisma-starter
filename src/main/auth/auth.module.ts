import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthRegisterService } from './services/auth-register.service';
import { UtilsModule } from '@/lib/utils/utils.module';
import { AuthLoginService } from './services/auth-login.service';

@Module({
  imports: [UtilsModule],
  controllers: [AuthController],
  providers: [AuthRegisterService, AuthLoginService]
})
export class AuthModule {}
