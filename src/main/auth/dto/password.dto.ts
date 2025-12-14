import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class PasswordDto {
    @ApiProperty({
        description: "Current password",
        example: "current123456",
    })
    @IsString()
    currentPassword: string;

    @ApiProperty({
        description: "New password",
        example: "new123456",
    })
    @IsString()
    newPassword: string;
}