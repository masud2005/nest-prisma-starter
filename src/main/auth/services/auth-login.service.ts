import { PrismaService } from "@/lib/prisma/prisma.service";
import { AuthUtilsService } from "@/lib/utils/services/auth-utils.service";
import { Injectable } from "@nestjs/common";
import { LoginDto } from "../dto/login.dto";

@Injectable()
export class AuthLoginService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly utils: AuthUtilsService,
    ) { }

    async login(dto: LoginDto) {
        const { email, password } = dto;

        const user = await this.prisma.client.user.findUnique({
            where: {
                email
            }
        })

        if(!user) {
            throw new Error('User not found');
        }

        const isPasswordMatch = await this.utils.compare(password, user.password);

        if(!isPasswordMatch) {
            throw new Error('Invalid password');
        }

        // User Activity
        const updatedUser = await this.prisma.client.user.update({
            where: {
                email
            },
            data: {
                lastLoginAt: new Date(),
                lastActiveAt: new Date(),
            }
        })


        return {
            data: updatedUser,
            message: 'User logged in successfully'
        }
    }
}