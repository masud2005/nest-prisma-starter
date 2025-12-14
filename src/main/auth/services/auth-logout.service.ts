import { PrismaService } from "@/lib/prisma/prisma.service";
import { AuthUtilsService } from "@/lib/utils/services/auth-utils.service";
import { Injectable } from "@nestjs/common";
import { LogoutDto, RefreshTokenDto } from "../dto/logout.dto";
import { AppError } from "@/common/exceptions/app-error";
import { CurrentUser } from "@/common/jwt/user.decorator";
import { sendResponse } from "@/common/response/sendResponse";
import { RefreshToken } from "@prisma";
import { AuthTokenService } from "@/lib/utils/services/auth-token.service";

@Injectable()
export class AuthLogoutService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly utils: AuthUtilsService,
        private readonly authTokenService: AuthTokenService
    ) { }

    async logout(user: CurrentUser, dto: LogoutDto) {

        // Ensure refresh token exists and belongs to the user
        const tokenRecord = await this.utils.findRefreshToken(dto.refreshToken);

        if (!tokenRecord || tokenRecord.userId !== user?.userId) {
            throw new AppError(400, 'Invalid refresh token');
        }

        // Delete the provided refresh token (logout)
        await this.utils.revokeAllRefreshTokensForUser(user?.userId);

        return sendResponse(null, { message: 'Logout successful' });
    }


    async refreshAccessToken(dto: RefreshTokenDto) {
        const tokenRecord = await this.utils.findRefreshToken(dto.refreshToken);

        if (!tokenRecord) {
            throw new AppError(400, 'Invalid or expired refresh token ');
        }

        // check if token is expired
        if (tokenRecord.expiresAt < new Date()) {
            await this.utils.revokeRefreshToken(dto.refreshToken);
            throw new AppError(400, 'Refresh token is expired');
        }

        // Get user info
        const user = await this.prisma.client.user.findUnique({
            where: { id: tokenRecord.userId },
        });

        if (!user) {
            await this.utils.revokeRefreshToken(dto.refreshToken);
            throw new AppError(400, 'User not found');
        }

        // Revoke old refresh token 
        await this.utils.revokeRefreshToken(dto.refreshToken);

        // Generate new access and refresh tokens
        const tokens = await this.authTokenService.generateTokenPairAndSave({
            sub: user.id,
            email: user.email,
            role: user.role,
        });

        return sendResponse(tokens, { message: 'Tokens refreshed successfully' });
    }

}