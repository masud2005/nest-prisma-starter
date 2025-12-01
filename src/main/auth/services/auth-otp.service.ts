import { PrismaService } from "@/lib/prisma/prisma.service";
import { BadRequestException, Injectable } from "@nestjs/common";
import { VerifyOtpDto } from "../dto/otp.dot";
import { OtpType } from "@prisma";
import { AuthUtilsService } from "@/lib/utils/services/auth-utils.service";


@Injectable()
export class AuthOtpService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly utils: AuthUtilsService
    ) { }

    async verifyOtp(dto: VerifyOtpDto, type: OtpType = OtpType.VERIFICATION) {

        const { email, otp } = dto

        // 1. Check if user exists
        const user = await this.prisma.client.user.findUnique({
            where: {
                email
            }
        })
        if (!user) {
            throw new BadRequestException('User not found');
        }

        // 2. Find latest otp for user and type
        const latestOtp = await this.prisma.client.userOtp.findFirst({
            where: {
                userId: user.id,
                type
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        console.log(latestOtp);
        // Check if otp exists
        if (!latestOtp) {
            throw new BadRequestException('OTP is not set. Please request a new one.');
        }
        // Check if otp is expired -> Delete this user otp
        if (latestOtp.expiresAt < new Date()) {
            await this.prisma.client.userOtp.delete({
                where: {
                    id: latestOtp.id
                }
            })
            throw new BadRequestException('OTP expired');
        }

        // compare otp
        const isOtpValid = await this.utils.compare(otp, latestOtp.code);

        // Check if otp is valid
        if (!isOtpValid) {
            throw new BadRequestException('Invalid OTP');
        }

        // 3. Delete otp
        await this.prisma.client.userOtp.deleteMany({
            where: {
                userId: user.id,
                type
            }
        })

        // 4. Mark user verified if verification otp
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

        return {
            user: user,
            message: 'OTP verified successfully'
        }
    }
}