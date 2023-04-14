import { ApiProperty } from '@nestjs/swagger';
import { UrlEntity } from '../url.entity';

export class GetUrlByCodeResponseDto {
  @ApiProperty()
  longUrl: string;

  @ApiProperty()
  shortUrl: string;

  static map(urlEntity: UrlEntity): GetUrlByCodeResponseDto {
    const dto = new GetUrlByCodeResponseDto();
    dto.shortUrl = urlEntity.shortUrl;
    dto.longUrl = urlEntity.longUrl;
    return dto;
  }
}
