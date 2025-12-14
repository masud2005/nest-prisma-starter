import { PrismaService } from "@/lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}


@Injectable()
export class AuthTokenService {

    private refreshTokenDays = 30;

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) { }

    async generateToken(payload: JwtPayload) {
        const token = this.jwtService.sign(payload, {
            secret: this.configService.getOrThrow('JWT_SECRET'),
            expiresIn: this.configService.getOrThrow('JWT_EXPIRES_IN')
        });
        return token
    }

    async generateTokenAndSave(payload: JwtPayload) {
        const accessToken = await this.generateToken(payload);

        const refreshToken = await this.generateToken(payload);

        const refreshTokenExpiresAt = new Date(
            Date.now() + this.refreshTokenDays * 24 * 60 * 60 * 1000
        );

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
            refreshTokenExpiresAt
        }
    }
}