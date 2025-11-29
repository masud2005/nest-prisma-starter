import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthUtilsService {
    private saltRounds = 10;
    constructor(
        private readonly prisma: PrismaService
    ) {}

    async hash(value: string): Promise<string> {
        return await bcrypt.hash(value, this.saltRounds)
    }

    async compare(value: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(value, hash)
    }
}
