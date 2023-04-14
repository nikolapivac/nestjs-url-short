import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UrlEntity } from './url/url.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(UrlEntity)
    private readonly urlRepo: Repository<UrlEntity>,
  ) {}

  async getLongUrl(urlCode: string): Promise<string> {
    const url = await this.urlRepo.findOneBy({ urlCode });

    if (url) {
      return url.longUrl;
    } else {
      throw new NotFoundException(`URL not found`);
    }
  }
}
