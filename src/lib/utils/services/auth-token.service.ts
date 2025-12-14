import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface AuthJwtPayload {
    sub: string;
    email: string;
    role: string;
}

@Injectable()
export class AuthTokenService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    /** Generate short or long-lived access token */
    private async signToken(
        payload: AuthJwtPayload,
        secretKey: string,
        expiresIn: string,
    ): Promise<string> {
        return this.jwtService.signAsync(
            payload as any,
            {
                secret: this.configService.getOrThrow<string>(secretKey),
                expiresIn: this.configService.getOrThrow<string>(expiresIn),
            } as any,
        );
    }

    /** Generate access token */
    async generateAccessToken(payload: AuthJwtPayload): Promise<string> {
        return this.signToken(
            payload,
            'JWT_ACCESS_SECRET',
            'JWT_ACCESS_EXPIRES_IN',
        );
    }

    /** Generate refresh token */
    private async generateRefreshToken(payload: AuthJwtPayload): Promise<string> {
        return this.signToken(
            payload,
            'JWT_REFRESH_SECRET',
            'JWT_REFRESH_EXPIRES_IN',
        );
    }

    /** Generate both tokens and store refresh token in DB */
    async generateTokenPairAndSave(payload: AuthJwtPayload) {
        const [accessToken, refreshToken] = await Promise.all([
            this.generateAccessToken(payload),
            this.generateRefreshToken(payload),
        ]);

        const refreshExpiresInDays = this.configService.getOrThrow<string>(
            'JWT_REFRESH_EXPIRES_IN',
        );
        const days = parseInt(refreshExpiresInDays.replace('d', ''), 10);
        const refreshTokenExpiresAt = new Date(
            Date.now() + days * 24 * 60 * 60 * 1000,
        );

        // Revoke all previous refresh tokens for this user
        await this.prisma.client.refreshToken.deleteMany({ where: { userId: payload.sub } });

        await this.prisma.client.refreshToken.create({
            data: {
                token: refreshToken,
                userId: payload.sub,
                expiresAt: refreshTokenExpiresAt,
            },
        });

        return {
            accessToken,
            refreshToken,
        };
    }

    /** Refresh access token using a valid refresh token */
    async refreshAccessToken(refreshToken: string) {
        try {
            // Verify with refresh secret
            const payload = await this.jwtService.verifyAsync<AuthJwtPayload>(
                refreshToken,
                {
                    secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
                },
            );

            // Check if token is stored and not expired
            const stored = await this.prisma.client.refreshToken.findUnique({
                where: { token: refreshToken },
            });

            if (!stored || stored.expiresAt < new Date()) {
                throw new BadRequestException('Invalid or expired refresh token');
            }

            // Implement refresh token rotation (delete after use)
            await this.prisma.client.refreshToken.delete({ where: { token: refreshToken } });

            // Issue new access token
            return {
                accessToken: await this.generateAccessToken(payload),
            };
        } catch {
            throw new BadRequestException('Invalid refresh token');
        }
    }

    /** Revoke all refresh tokens for a user (e.g., on logout or password change) */
    async revokeRefreshTokens(userId: string) {
        await this.prisma.client.refreshToken.deleteMany({
            where: { userId },
        });
    }
}