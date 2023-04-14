import { ApiProperty } from '@nestjs/swagger';

export class SignUpResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;

  static map(response: { message: string; statusCode: number }) {
    const dto = new SignUpResponseDto();
    dto.message = response.message;
    dto.statusCode = response.statusCode;

    return dto;
  }
}
