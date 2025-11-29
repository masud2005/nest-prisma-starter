import { Body, Controller, Post } from '@nestjs/common';
import { AuthRegisterService } from './services/auth-register.service';
import { ApiOperation } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthLoginService } from './services/auth-login.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authRegisterService: AuthRegisterService,
        private readonly authLoginService: AuthLoginService
    ) { }

    @ApiOperation({ summary: 'User regigtration with email and password' })
    @Post('register')
    async register(@Body() body: RegisterDto) {
        return this.authRegisterService.register(body)
    }

    @ApiOperation({summary: 'User login with email and password'})
    @Post('login')
    async login(@Body() body: LoginDto) {
        return this.authLoginService.login(body);
    }
}
