import { Module } from '@nestjs/common';
import { AuthUtilsService } from './services/auth-utils.service';
import { AuthTokenService } from './services/auth-token.service';

@Module({
  providers: [AuthUtilsService, AuthTokenService],
  exports: [AuthUtilsService, AuthTokenService]
})
export class UtilsModule {}
