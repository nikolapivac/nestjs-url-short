import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.decorator';
import { UserEntity } from 'src/auth/user.entity';
import { CreateUrlResponseDto } from './dto/create-url-response.dto';
import { CreateUrlDto } from './dto/create-url.dto';
import { GetUrlByCodeResponseDto } from './dto/get-url-by-code-response.dto';
import { UrlService } from './url.service';

@ApiTags('url')
@ApiBearerAuth()
@Controller('url')
@UseGuards(AuthGuard())
export class UrlController {
  private logger = new Logger('UrlController');
  constructor(private urlService: UrlService) {}

  // shorten (create) URL
  @Post('/shorten')
  @ApiOperation({ summary: 'Shorten a URL' })
  @ApiCreatedResponse({
    description: 'URL successfully created/shortened',
    type: CreateUrlResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Bad Request: Invalid URL' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async createUrl(
    @Body() createUrlDto: CreateUrlDto,
    @GetUser() user: UserEntity,
  ) {
    this.logger.verbose(`User ${user.username} shortening a URL`);
    const urlEntity = await this.urlService.createUrl(createUrlDto, user);
    return CreateUrlResponseDto.map(urlEntity);
  }

  // get all user's URLs
  @Get()
  @ApiOperation({ summary: 'Get all URLs for user' })
  @ApiOkResponse({
    description: 'Successfully retrieved URLs',
    type: [CreateUrlResponseDto],
  })
  @ApiInternalServerErrorResponse({ description: 'Failed to retrieve URLs' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getUrls(@GetUser() user: UserEntity) {
    this.logger.verbose(`User ${user.username} retrieving all URLs`);
    const urlEntites = await this.urlService.getUrls(user);
    return CreateUrlResponseDto.mapArray(urlEntites);
  }

  // get URL by code
  @Get('/:code')
  @ApiOperation({ summary: 'Get URL by code' })
  @ApiOkResponse({
    description: 'Successfully retrieved URL',
    type: GetUrlByCodeResponseDto,
  })
  @ApiInternalServerErrorResponse({ description: 'Failed to retrieve URLs' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getUrlByCode(
    @Param('code') urlCode: string,
    @GetUser() user: UserEntity,
  ) {
    this.logger.verbose(
      `User ${user.username} retrieving URL by code ${urlCode}`,
    );
    const urlEntity = await this.urlService.getUrlByCode(urlCode, user);
    return GetUrlByCodeResponseDto.map(urlEntity);
  }

  // delete URL
  @Delete('/:code')
  @ApiOperation({ summary: 'Delete URL by code' })
  @ApiOkResponse({ description: 'URL successfully deleted' })
  @ApiNotFoundResponse({ description: 'URL not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  deleteUrl(@Param('code') urlCode: string, @GetUser() user: UserEntity) {
    this.logger.verbose(
      `User ${user.username} deleting URL by code ${urlCode}`,
    );
    return this.urlService.deleteUrl(urlCode, user);
  }
}
