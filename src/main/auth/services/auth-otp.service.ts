import { PrismaService } from "@/lib/prisma/prisma.service";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ResendOtpDto, VerifyOtpDto } from "../dto/otp.dto";
import { OtpType } from "@prisma";
import { AuthUtilsService } from "@/lib/utils/services/auth-utils.service";
import { AuthMailService } from "@/lib/mail/services/auth-mail.service";
import { AuthTokenService } from "@/lib/utils/services/auth-token.service";
import { AppError } from "@/common/exceptions/app-error";
import { sendResponse } from "@/common/response/sendResponse";


@Injectable()
export class AuthOtpService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly utils: AuthUtilsService,
        private readonly authMailService: AuthMailService,
        private readonly authTokenService: AuthTokenService
    ) { }

    async verifyOtp(dto: VerifyOtpDto, type: OtpType = OtpType.VERIFICATION) {

        const { email, otp } = dto

        // Check if user exists
        const user = await this.prisma.client.user.findUnique({
            where: {
                email
            }
        })
        if (!user) {
            throw new BadRequestException('User not found');
        }

        // Find latest otp for user and type
        const latestOtp = await this.prisma.client.userOtp.findFirst({
            where: {
                userId: user.id,
                type
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Check if otp exists
        if (!latestOtp) {
            throw new AppError('OTP is not set. Please request a new one.', 400);
        }
        // Check if otp is expired -> Delete this user otp
        if (latestOtp.expiresAt < new Date()) {
            await this.prisma.client.userOtp.delete({
                where: {
                    id: latestOtp.id
                }
            })
            throw new AppError('OTP expired', 400);
        }

        // compare otp
        const isOtpValid = await this.utils.compare(otp, latestOtp.code);

        // Check if otp is valid
        if (!isOtpValid) {
            throw new AppError('Invalid OTP', 400);
        }

        // Delete otp
        await this.prisma.client.userOtp.deleteMany({
            where: {
                userId: user.id,
                type
            }
        })

        // Mark user verified if verification otp
        if (type === OtpType.VERIFICATION) {
            await this.prisma.client.user.update({
                where: {
                    id: user.id
                },
                data: {
                    isVerified: true,
                    lastLoginAt: new Date(),
                    lastActiveAt: new Date(),
                }
            })
        }

        // Generate token
        const token = await this.authTokenService.generateTokenAndSave({
            sub: user.id,
            email: user.email,
            role: user.role
        })

        return sendResponse(
            {
                ...user,
                token
            },
            {
                message: 'OTP verified successfully',
                statusCode: 200,
            }
        );
    }

    async resendOtp({ email, type }: ResendOtpDto) {

        // Check if user exists
        const user = await this.prisma.client.user.findUnique({
            where: {
                email
            }
        })
        if (!user) {
            throw new BadRequestException('User not found');
        }

        // if user is already verified
        if (user.isVerified && type === OtpType.VERIFICATION) {
            throw new BadRequestException('User is already verified')
        }

        // Delete existing unexpired OTPs is this type
        await this.prisma.client.userOtp.deleteMany({
            where: {
                userId: user.id,
                type,
                expiresAt: { gt: new Date() }
            }
        })

        // Generate new OTP and hash
        const otp = await this.utils.generateOTPAndSave(user?.id, type)

        // Send email
        try {
            if (type === OtpType.VERIFICATION) {
                await this.authMailService.sendVerificationEmail(
                    email,
                    otp.toString(),
                    {
                        subject: 'Your OTP Code',
                        message: 'Here is your OTP code. It will expire in 5 minutes.',
                    }
                )
            }

            if (type === OtpType.RESET_PASSWORD) {
                await this.authMailService.sendResetPasswordEmail(
                    email,
                    otp.toString(),
                    {
                        subject: 'Your OTP Code',
                        message: 'Here is your OTP code. It will expire in 5 minutes.',
                    }
                )
            }
        } catch (error) {
            console.log(error);
            // Clean up in case email fails
            await this.prisma.client.userOtp.deleteMany({
                where: {
                    userId: user.id,
                    type
                }
            })

            throw new BadRequestException('Failed to send OTP email. Please try again later.');
        }

        return sendResponse(
            null,
            {
                message: `${type} OTP sent successfully`,
                statusCode: 200
            }
        );
    }
}