import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UrlController } from './url.controller';
import { UrlEntity } from './url.entity';
import { UrlService } from './url.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
    }),
    TypeOrmModule.forFeature([UrlEntity]),
    AuthModule,
  ],
  controllers: [UrlController],
  providers: [UrlService],
})
export class UrlModule {}
