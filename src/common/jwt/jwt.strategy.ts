import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { AuthJwtPayload } from '@/lib/utils/services/auth-token.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow('JWT_ACCESS_SECRET'),
        });
    }

    async validate(payload: AuthJwtPayload) {
        const user = await this.prisma.client.user.findUnique({
            where: { id: payload.sub },
        });
        if (!user || !user.isVerified) {
            throw new UnauthorizedException('User not found or not verified');
        }
        return { userId: user.id, email: user.email, role: user.role };
    }
}
