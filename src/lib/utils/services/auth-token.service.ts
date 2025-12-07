import { PrismaService } from "@/lib/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

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
        private readonly jwtService: JwtService
    ) { }

    async generateToken(payload: JwtPayload) {
        const token = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '1d'
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