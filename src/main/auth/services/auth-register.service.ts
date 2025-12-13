import { PrismaService } from "@/lib/prisma/prisma.service";
import { BadRequestException, Injectable } from "@nestjs/common";
import { RegisterDto } from "../dto/register.dto";
import { AuthUtilsService } from "@/lib/utils/services/auth-utils.service";
import { AuthMailService } from "@/lib/mail/services/auth-mail.service";
import { sendResponse } from "@/common/response/sendResponse";

@Injectable()
export class AuthRegisterService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly utils: AuthUtilsService,
        private readonly authMailService: AuthMailService
    ) { }

    async register(dto: RegisterDto) {
        const { email, name, password } = dto;
        console.log(email, name, password);

        // Check if user email already exists
        const existingUser = await this.prisma.client.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new BadRequestException('User already exists with this email');
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
        await this.authMailService.sendVerificationEmail(
            email,
            otp.toString(),
            {
                subject: 'Verify your email',
                message:
                    'Welcome to our platform! Your account has been successfully created.',
            }
        )

        return sendResponse(
            {
                email: newUser.email,
            },
            {
                message: `Registration successful. A verification email has been sent to ${newUser.email}.`
            }
        )
    }
}