import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../user.entity';

export class SignUpResponseDto {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  statusCode: number;

  static map(user: UserEntity): SignUpResponseDto {
    const dto = new SignUpResponseDto();
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.email = user.email;
    dto.username = user.username;
    dto.statusCode = 200;
    return dto;
  }
}
