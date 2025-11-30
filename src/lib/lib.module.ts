import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UtilsModule } from './utils/utils.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [PrismaModule, UtilsModule, MailModule]
})
export class LibModule {}
