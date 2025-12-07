import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthUtilsService } from './services/auth-utils.service';
import { AuthTokenService } from './services/auth-token.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [AuthUtilsService, AuthTokenService],
  exports: [AuthUtilsService, AuthTokenService]
})
export class UtilsModule {}
