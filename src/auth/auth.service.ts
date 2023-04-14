import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { SignUpResponseDto } from './dto/sign-up-response.dto';
import { JwtPayload } from './jwt-payload.interface';
import { UserEntity } from './user.entity';

@Injectable()
export class AuthService {
  private logger = new Logger();
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    // this service is exported by JwtModule, used to sign tokens
    private jwtService: JwtService,
  ) {}

  async signUp(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<SignUpResponseDto> {
    const { username, password } = authCredentialsDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepo.create({ username, password: hashedPassword });
    try {
      await this.userRepo.save(user);
      this.logger.verbose(`User ${user.username} signed up successfully`);
      const message = 'User signed up successfully';
      return { message: message, statusCode: 200 };
    } catch (error) {
      if (error.code === '23505') {
        const message = 'Username already in use';
        return { message: message, statusCode: 409 };
      } else {
        this.logger.error(`User ${user.username} failed to sign up`);
        const message = 'Internal server error';
        return { message: message, statusCode: 500 };
      }
    }
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const { username, password } = authCredentialsDto;
    const user = await this.userRepo.findOneBy({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = { username };
      const accessToken: string = await this.jwtService.sign(payload);
      this.logger.verbose(`User ${username} successfully signed in`);
      return { accessToken };
    } else {
      this.logger.error(`User ${username} failed to sign in`);
      throw new UnauthorizedException('Please check your credentials');
    }
  }
}
