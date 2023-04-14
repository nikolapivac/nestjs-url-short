import { Controller, Get, Param, Res } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AppService } from './app.service';

@ApiTags('app')
@Controller('app')
export class AppController {
  constructor(private appService: AppService) {}

  @Get('/:code')
  @ApiOperation({ summary: 'Redirects user to original URL' })
  @ApiOkResponse({ description: 'Successfully redirected' })
  @ApiNotFoundResponse({ description: 'URL not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async redirectToLong(
    @Param('code') urlCode: string,
    @Res() response: Response,
  ) {
    const longUrl = await this.appService.getLongUrl(urlCode);

    try {
      return response.redirect(longUrl);
    } catch (error) {
      return response.status(500).json({ statusCode: 500 });
    }
  }
}
