import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AuthCredentialsDto {
  @ApiProperty({ minimum: 4, maximum: 20, example: 'user1234' })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/^(?=.*[a-zA-Z])([a-zA-Z0-9_.-]+)$/, {
    message:
      'Username must contain letters and can contain numbers, underscores, dots and dashes',
  })
  username: string;

  @ApiProperty({
    description:
      'Must contain 1 uppercase letter, 1 lowercase letter, a number or special character',
    minimum: 8,
    example: 'Password123',
  })
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Passwords must contain at least 1 upper case letter, 1 lower case letter and one number OR special charracter.',
  })
  password: string;
}
