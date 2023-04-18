import { ApiProperty } from '@nestjs/swagger';

export class TokenVerifyResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;
}
