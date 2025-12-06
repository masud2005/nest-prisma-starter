import { PrismaService } from "@/lib/prisma/prisma.service";
import { AuthUtilsService } from "@/lib/utils/services/auth-utils.service";
import { BadRequestException, Injectable } from "@nestjs/common";
import { LoginDto } from "../dto/login.dto";
import { AuthMailService } from "@/lib/mail/services/auth-mail.service";
import { sendResponse } from "@/common/response/sendResponse";
import { errorResponse } from "@/common/response/errorResponse";
import { AppError } from "@/common/exceptions/app-error";

@Injectable()
export class AuthLoginService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly utils: AuthUtilsService,
        private readonly authMailService: AuthMailService
    ) { }

    async login(dto: LoginDto) {
        const { email, password } = dto;

        const user = await this.prisma.client.user.findUnique({
            where: {
                email
            }
        })

        if (!user) {
            throw new AppError('User not found', 404);
        }

        const isPasswordMatch = await this.utils.compare(password, user.password);

        if (!isPasswordMatch) {
            throw new AppError('Invalid credentials', 401);
        }

        // User not verified
        if (!user.isVerified) {
            const otp = await this.utils.generateOTPAndSave(user.id, 'VERIFICATION');

            await this.authMailService.sendVerificationEmail(email, otp.toString());

            return {
                message: `User not verified. A verification email has been sent to ${email}.`
            }
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


        // return {
        //     data: updatedUser,
        //     message: 'User logged in successfully',
        //     statusCode: 200
        // }
        return sendResponse(
            updatedUser,
            {
                message: 'User logged in successfully',
                statusCode: 200,
            }
        );
    }
}