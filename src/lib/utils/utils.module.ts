import { Module } from '@nestjs/common';
import { AuthUtilsService } from './services/auth-utils.service';

@Module({
  providers: [AuthUtilsService],
  exports: [AuthUtilsService]
})
export class UtilsModule {}
