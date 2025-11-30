import { Injectable } from "@nestjs/common";
import { MailService } from "../mail.service";
import * as nodemailer from 'nodemailer';
import * as he from 'he';
import { otpTemplate } from "../templates/otp.template";

interface EmailOptions {
    subject?: string;
    message?: string;
}

@Injectable()
export class AuthMailService {
    constructor(
        private readonly mailService: MailService
    ) { }

    private async sendMail(
        to: string,
        subject: string,
        html: string,
        text: string
    ): Promise<nodemailer.SentMessageInfo> {
        return this.mailService.sendMail({ to, subject, html, text })
    }

    private sanitize(input: string) {
        return he.encode(input);
    }

    async sendVerificationEmail(
        to: string,
        code: string,
        options: EmailOptions = {},
    ): Promise<nodemailer.SentMessageInfo> {
        const subject = this.sanitize(options.subject || 'Verification Code')
        const message = this.sanitize(options.message || 'Verify your account')
        const safeCode = this.sanitize(code)

        return this.sendMail(
            to,
            subject,
            otpTemplate({
                title: 'Verification Code',
                message,
                code: safeCode,
                footer: 'This code will expire in 5 minutes'
            }),
            `${message}\n\nVerification Code: ${safeCode}\n\nThis code will expire in 5 minutes`,
        )
    }
}