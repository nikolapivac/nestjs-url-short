import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { SignInResponseDto } from './dto/sign-in-response.dto';
import { SignUpResponseDto } from './dto/sign-up-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({
    description: 'User successfully signed up',
    type: SignUpResponseDto,
  })
  @ApiConflictResponse({
    description: 'Username already exists',
    type: SignUpResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error: Failed to sign up',
    type: SignUpResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid credentials' })
  async signUp(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<SignUpResponseDto> {
    const response = await this.authService.signUp(authCredentialsDto);
    return SignUpResponseDto.map(response);
  }

  @Post('/signin')
  @ApiOperation({ summary: 'Sign in' })
  @ApiCreatedResponse({
    description: 'User successfully signed in',
    type: SignInResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid credentials' })
  @ApiUnauthorizedResponse({
    description: 'User not found: Incorrect credentials',
  })
  async signIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<SignInResponseDto> {
    const token = await this.authService.signIn(authCredentialsDto);
    return SignInResponseDto.map(token);
  }
}
