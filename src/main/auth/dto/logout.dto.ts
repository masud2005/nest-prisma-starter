import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class LogoutDto {
    @ApiProperty({ description: 'Refresh token', example: 'refreshToken' })
    @IsString()
    refreshToken: string;
}

export class RefreshTokenDto {
    @ApiProperty({ description: 'Refresh token', example: 'refreshToken' })
    @IsString()
    refreshToken: string;
}
