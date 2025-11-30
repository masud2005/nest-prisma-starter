import { PrismaService } from "@/lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { RegisterDto } from "../dto/register.dto";
import { AuthUtilsService } from "@/lib/utils/services/auth-utils.service";

@Injectable()
export class AuthRegisterService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly utils: AuthUtilsService,
    ) { }

    async register(dto: RegisterDto) {
        const { email, name, password } = dto;

        // Check if user email already exists
        const existingUser = await this.prisma.client.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new Error('User already exists with this email');
        }

        // Create new user
        const newUser = await this.prisma.client.user.create({
            data: {
                email,
                name,
                password: await this.utils.hash(password)
            }
        })

        // Generate Otp and Save
        const otp = await this.utils.generateOTPAndSave(newUser.id, 'VERIFICATION')

        // Send verification email
        

        return {
            data: newUser,
            message: 'User created successfully'
        }
    }
}