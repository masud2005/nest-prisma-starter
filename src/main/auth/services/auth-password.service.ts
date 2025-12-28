import { AppError } from "@/common/exceptions/app-error";
import { CurrentUser } from "@/common/jwt/user.decorator";
import { sendResponse } from "@/common/response/sendResponse";
import { AuthMailService } from "@/lib/mail/services/auth-mail.service";
import { PrismaService } from "@/lib/prisma/prisma.service";
import { AuthUtilsService } from "@/lib/utils/services/auth-utils.service";
import { Injectable } from "@nestjs/common";
import { OtpType } from "@prisma";
import { PasswordDto, ResetPasswordDto } from "../dto/password.dto";

@Injectable()
export class AuthPasswordService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly utils: AuthUtilsService,
        private readonly authMailService: AuthMailService
    ) { }

    // Change Password
    async changePassword(user: CurrentUser, dto: PasswordDto) {
        const isUser = await this.prisma.client.user.findUnique({
            where: { id: user?.userId }
        });
        if (!isUser) throw new AppError(404, 'User not found');

        // If user registered via social login and has no password set
        if (!isUser.password) {
            const hashedPassword = await this.utils.hash(dto.newPassword);
            await this.prisma.client.user.update({
                where: { id: user?.userId },
                data: { password: hashedPassword }
            })
            return sendResponse(null, { message: 'Password changed successfully' });
        }

        // Normal users must provide current password
        if (!dto.currentPassword) {
            throw new AppError(400, 'Current password is required')
        };

        // Check if current password is correct
        const isPasswordMatch = await this.utils.compare(dto.currentPassword, isUser.password);
        if (!isPasswordMatch) {
            throw new AppError(400, 'Current password is incorrect');
        }

        // Hash new password
        const hashedPassword = await this.utils.hash(dto.newPassword);
        await this.prisma.client.user.update({
            where: { id: user?.userId },
            data: { password: hashedPassword }
        })
        return sendResponse(null, { message: 'Password changed successfully' });
    }

    // Forgot Password
    async forgotPassword(email: string) {
        const user = await this.prisma.client.user.findUnique({ where: { email } });
        if (!user) {
            throw new AppError(404, 'User not found')
        };

        // Delete previous unexpired RESET OTPs
        await this.prisma.client.userOtp.deleteMany({
            where: {
                userId: user.id,
                type: OtpType.RESET_PASSWORD,
                expiresAt: { gt: new Date() },
            },
        });

        // Generate OTP, hash and save
        const otp = await this.utils.generateOTPAndSave(user?.id, OtpType.RESET_PASSWORD);

        // Send email
        await this.authMailService.sendResetPasswordEmail(email, otp.toString());

        return sendResponse(null, { message: `Password reset OTP sent to ${email}.` });
    }

    // Reset Password
    async resetPassword(dto: ResetPasswordDto) {
        const { email, otp, newPassword } = dto;

        // Check if user exists
        const user = await this.prisma.client.user.findUnique({ where: { email } });
        if (!user) {
            throw new AppError(404, 'User not found');
        }

        // Find latest RESET_OTP for user
        const latestOtp = await this.prisma.client.userOtp.findFirst({
            where: {
                userId: user.id,
                type: OtpType.RESET_PASSWORD,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Check if otp exists
        if (!latestOtp) {
            throw new AppError(400, 'OTP is not set. Please request a new one.');
        }

        // Check if otp is expired -> Delete this user otp
        if (latestOtp.expiresAt < new Date()) {
            await this.prisma.client.userOtp.deleteMany({
                where: {
                    userId: user.id,
                    type: OtpType.RESET_PASSWORD,
                },
            });
            throw new AppError(400, 'OTP is expired. Please request a new one.');
        }

        // Check if otp is correct
        const isOtpMatch = await this.utils.compare(otp, latestOtp.code);
        if (!isOtpMatch) {
            throw new AppError(400, 'OTP is incorrect');
        }

        // Hash new password
        const hashedPassword = await this.utils.hash(newPassword);

        // Update password and delete otp
        await this.prisma.client.user.update({
            where: { id: user?.id },
            data: { password: hashedPassword }
        })
        await this.prisma.client.userOtp.delete({ where: { id: latestOtp.id } });

        return sendResponse(null, { message: 'Password reset successfully' });
    }
}