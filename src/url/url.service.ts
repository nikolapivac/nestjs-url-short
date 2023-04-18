import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { nanoid } from 'nanoid';
import { UserEntity } from 'src/auth/user.entity';
import { Repository } from 'typeorm';
import { CreateUrlDto } from './dto/create-url.dto';
import { UrlEntity } from './url.entity';

@Injectable()
export class UrlService {
  private logger = new Logger();
  constructor(
    @InjectRepository(UrlEntity)
    private readonly urlRepo: Repository<UrlEntity>,
    private configService: ConfigService,
  ) {}

  async createUrl(
    createUrlDto: CreateUrlDto,
    user: UserEntity,
  ): Promise<UrlEntity> {
    const { longUrl } = createUrlDto;
    const baseUrl = `${this.configService.get(
      'BASE_URL',
    )}:${this.configService.get('SERVER_PORT')}/app`;

    const urlCode = nanoid();

    let url = await this.urlRepo.findOneBy({ longUrl, user });

    if (url) {
      return url;
    } else {
      const shortUrl = baseUrl + '/' + urlCode;

      url = this.urlRepo.create({
        urlCode,
        longUrl,
        shortUrl,
        user,
      });
      this.logger.verbose(`New URL created for user ${user.username}`);

      await this.urlRepo.save(url);
      this.logger.verbose(
        `URL for user ${user.username} saved in the database`,
      );
      return url;
    }
  }

  async getUrls(user: UserEntity): Promise<UrlEntity[]> {
    try {
      return await this.urlRepo.find({ where: { user: user } });
    } catch (error) {
      this.logger.error(`Failed to get URLs for user ${user.username}`);
      throw new InternalServerErrorException();
    }
  }

  async getUrlByCode(urlCode: string, user: UserEntity): Promise<UrlEntity> {
    const found = await this.urlRepo.findOneBy({ urlCode, user });

    if (!found) {
      this.logger.error(`URL for user ${user.username} not found`);
      throw new NotFoundException(`URL with code "${urlCode}" not found`);
    }

    return found;
  }

  async deleteUrl(urlCode: string, user: UserEntity): Promise<void> {
    const result = await this.urlRepo.delete({ urlCode, user });
    if (result.affected === 0) {
      this.logger.error(`URL for user ${user.username} not found`);
      throw new NotFoundException(`URL with code "${urlCode}" not found`);
    }
  }
}
