import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

export class CreateUrlDto {
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  @ApiProperty({ description: 'Must be a valid URL.' })
  longUrl: string;
}
