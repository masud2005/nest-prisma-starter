import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class PasswordDto {
    @ApiProperty({
        description: "Current password. Optional for Google Sign-In",
        example: "current123456",
    })
    @IsString()
    @IsOptional()
    currentPassword?: string;

    @ApiProperty({
        description: "New password",
        example: "new123456",
    })
    @IsString()
    newPassword: string;
}

export class ForgotPasswordDto {
    @ApiProperty({
        description: "Email address",
        example: "masud.softvenceomega@gmail.com",
    })
    @IsString()
    email: string;
}


export class ResetPasswordDto {
    @ApiProperty({
        description: "Email address",
        example: "masud.softvenceomega@gmail.com"
    })
    @IsString()
    email: string

    @ApiProperty({
        description: "OTP code",
        example: "123456"
    })
    @IsString()
    otp: string

    @ApiProperty({
        description: 'New password',
        example: '123456'
    })
    @IsString()
    newPassword: string;
}