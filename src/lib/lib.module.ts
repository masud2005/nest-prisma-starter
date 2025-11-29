import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [PrismaModule, UtilsModule]
})
export class LibModule {}
