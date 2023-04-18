import { ApiProperty } from '@nestjs/swagger';

export class SignInResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  validEmail: boolean;

  static map(token: string, validEmail: boolean): SignInResponseDto {
    const dto = new SignInResponseDto();
    dto.accessToken = token;
    dto.validEmail = validEmail;
    return dto;
  }
}
