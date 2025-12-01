import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class VerifyOtpDto {
    @ApiProperty({
        example: '123456',
        description: 'The one-time password (OTP) code sent to the user for verification',
    })
    @IsNotEmpty({ message: 'OTP is required' })
    otp: string

    @ApiProperty({
        example: 'masud@gmail.com',
        description: 'User email address',
    })
    @IsNotEmpty({ message: 'Email is required' })
    email: string
}