import { ApiProperty } from '@nestjs/swagger';

export class SignInResponseDto {
  @ApiProperty()
  accessToken: string;

  static map(token: { accessToken: string }): SignInResponseDto {
    const dto = new SignInResponseDto();
    dto.accessToken = token.accessToken;
    return dto;
  }
}
