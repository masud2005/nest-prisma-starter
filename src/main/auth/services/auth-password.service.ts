import { AuthMailService } from "@/lib/mail/services/auth-mail.service";
import { PrismaService } from "@/lib/prisma/prisma.service";
import { AuthUtilsService } from "@/lib/utils/services/auth-utils.service";
import { Injectable } from "@nestjs/common";
import { PasswordDto } from "../dto/password.dto";
import { CurrentUser } from "@/common/jwt/user.decorator";
import { AppError } from "@/common/exceptions/app-error";
import { send } from "process";
import { sendResponse } from "@/common/response/sendResponse";

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

}