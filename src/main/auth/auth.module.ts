import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthRegisterService } from './services/auth-register.service';
import { UtilsModule } from '@/lib/utils/utils.module';
import { AuthLoginService } from './services/auth-login.service';
import { MailModule } from '@/lib/mail/mail.module';
import { AuthOtpService } from './services/auth-otp.service';
import { AuthLogoutService } from './services/auth-logout.service';

@Module({
  imports: [UtilsModule, MailModule],
  controllers: [AuthController],
  providers: [AuthRegisterService, AuthLoginService, AuthOtpService, AuthLogoutService],
})
export class AuthModule {}
