import { Body, Controller, Post } from '@nestjs/common';
import { AuthRegisterService } from './services/auth-register.service';
import { ApiOperation } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authRegisterService: AuthRegisterService,
    ) { }

    @ApiOperation({ summary: 'User regigtration with email and password' })
    @Post('register')
    async(@Body() body: RegisterDto) {
        return this.authRegisterService.register(body)
    }
}
