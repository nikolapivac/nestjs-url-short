import { ApiProperty } from '@nestjs/swagger';

export class SignInResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  validEmail: boolean;

  @ApiProperty()
  email: string;

  static map(
    token: string,
    validEmail: boolean,
    email: string,
  ): SignInResponseDto {
    const dto = new SignInResponseDto();
    dto.accessToken = token;
    dto.validEmail = validEmail;
    dto.email = email;
    return dto;
  }
}
