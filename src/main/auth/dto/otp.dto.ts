import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { OtpType } from "@prisma";
import { IsEmail, IsEnum, IsNotEmpty } from "class-validator";

export class VerifyOtpDto {
    @ApiProperty({
        example: '123456',
        description: 'The one-time password (OTP) code sent to the user for verification',
    })
    @IsNotEmpty({ message: 'OTP is required' })
    otp: string

    @ApiProperty({
        example: 'masud.softvenceomega@gmail.com',
        description: 'User email address',
    })
    @IsNotEmpty({ message: 'Email is required' })
    email: string
}

export class ResendOtpDto {
    @ApiProperty({
        example: 'john@gmail.com',
        description: 'User email address',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiPropertyOptional({
        example: OtpType.VERIFICATION,
        description: 'OTP type',
        enum: OtpType,
    })
    @IsNotEmpty()
    @IsEnum(OtpType)
    type: OtpType = OtpType.VERIFICATION;
}