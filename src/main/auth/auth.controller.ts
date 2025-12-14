import { Roles } from '@/common/jwt/roles.decorator';
import { RolesGuard } from '@/common/jwt/roles.guard';
import { CurrentUser, User } from '@/common/jwt/user.decorator';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { ResendOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthLoginService } from './services/auth-login.service';
import { AuthOtpService } from './services/auth-otp.service';
import { AuthRegisterService } from './services/auth-register.service';
import { Role } from '@prisma';
import { LogoutDto, RefreshTokenDto } from './dto/logout.dto';
import { AuthLogoutService } from './services/auth-logout.service';
import { PasswordDto } from './dto/password.dto';
import { AuthPasswordService } from './services/auth-password.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authRegisterService: AuthRegisterService,
    private readonly authLoginService: AuthLoginService,
    private readonly authLogoutService: AuthLogoutService,
    private readonly authOtpService: AuthOtpService,
    private readonly authPasswordService: AuthPasswordService
  ) { }

  @ApiOperation({ summary: 'User regigtration with email and password' })
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authRegisterService.register(body);
  }

  @ApiOperation({ summary: 'User login with email and password' })
  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authLoginService.login(body);
  }

  @ApiOperation({ summary: 'Otp verify after registration' })
  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authOtpService.verifyOtp(body);
  }

  @ApiOperation({ summary: 'Resend otp' })
  @Post('resend-otp')
  async resentOtp(@Body() body: ResendOtpDto) {
    return this.authOtpService.resendOtp(body);
  }

  @ApiOperation({ summary: 'User logout' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@User() user: CurrentUser, @Body() body: LogoutDto) {
    return this.authLogoutService.logout(user, body);
  }

  @ApiOperation({ summary: "Refresh token" })
  @Post('refresh-token')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authLogoutService.refreshAccessToken(dto);
  }

  @ApiOperation({ summary: "Change password" })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  async changePassword(@User() user: CurrentUser, @Body() dto: PasswordDto) {
    return this.authPasswordService.changePassword(user, dto);
  }

  @ApiOperation({
    summary: 'Admin only endpoint - for testing JWT with role-based access',
  })
  @ApiBearerAuth()
  @Get('admin')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  adminOnly(@User() user: CurrentUser) {
    return {
      message: 'This is for admins only. Testing purpose...',
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @ApiOperation({
    summary: 'Protected endpoint - for testing JWT authentication',
  })
  @ApiBearerAuth()
  @Get('protected')
  @UseGuards(AuthGuard('jwt'))
  protectedRoute(@User() user: CurrentUser) {
    return {
      message: 'Any logged in user can access this. Testing purpose...',
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
