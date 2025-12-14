import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { AuthMailService } from './services/auth-mail.service';

@Module({
  imports: [ConfigModule],
  providers: [MailService, AuthMailService],
  exports: [AuthMailService],
})
export class MailModule { }
