import { ApiProperty } from '@nestjs/swagger';
import { UrlEntity } from '../url.entity';

export class CreateUrlResponseDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  shortUrl: string;

  @ApiProperty()
  longUrl: string;

  static map(urlEntity: UrlEntity): CreateUrlResponseDto {
    const dto = new CreateUrlResponseDto();
    dto.code = urlEntity.urlCode;
    dto.shortUrl = urlEntity.shortUrl;
    dto.longUrl = urlEntity.longUrl;
    return dto;
  }

  static mapArray(urlEntities: UrlEntity[]): CreateUrlResponseDto[] {
    return urlEntities.map((urlEntity) => this.map(urlEntity));
  }
}
