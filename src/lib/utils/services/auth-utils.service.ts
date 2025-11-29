import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { OtpType } from '@prisma';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'node:crypto';

@Injectable()
export class AuthUtilsService {
    private saltRounds = 10;
    constructor(
        private readonly prisma: PrismaService
    ) { }

    generateOtpAndExpiry(minutes = 5) {
        const otp = randomInt(100000, 999999);
        const expiryTime = new Date(Date.now() + minutes * 60 * 1000);
        return { otp, expiryTime }
    }

    async generateOTPAndSave(userId: string, type: OtpType) {
        const { otp, expiryTime } = this.generateOtpAndExpiry();
        const hashedOtp = await this.hash(otp.toString());
        await this.prisma.client.userOtp.create({
            data: {
                userId,
                code: hashedOtp,
                type,
                expiresAt: expiryTime,
            },
        });
        return otp;
    }

    async hash(value: string): Promise<string> {
        return await bcrypt.hash(value, this.saltRounds)
    }

    async compare(value: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(value, hash)
    }
}
