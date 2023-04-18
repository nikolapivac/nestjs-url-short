import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  SignInCredentialsDto,
  SignUpCredentialsDto,
} from './dto/auth-credentials.dto';
import { SignInResponseDto } from './dto/sign-in-response.dto';
import { SignUpResponseDto } from './dto/sign-up-response.dto';
import { TokenVerifyResponseDto } from './dto/token-verify-response.dto';
import { GetUser } from './get-user.decorator';
import { UserEntity } from './user.entity';

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
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error: Failed to sign up',
  })
  @ApiBadRequestResponse({ description: 'Invalid credentials' })
  async signUp(
    @Body() signUpCredentialsDto: SignUpCredentialsDto,
  ): Promise<SignUpResponseDto> {
    const newUser = await this.authService.signUp(signUpCredentialsDto);

    await this.authService.createEmailToken(newUser.email);
    const sent = await this.authService.sendEmailVerification(newUser.email);

    if (!sent) {
      throw new InternalServerErrorException('Verification e-mail not sent');
    }

    return SignUpResponseDto.map(newUser);
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
    @Body() signInCredentialsDto: SignInCredentialsDto,
  ): Promise<SignInResponseDto> {
    const { accessToken, validEmail } = await this.authService.signIn(
      signInCredentialsDto,
    );
    return SignInResponseDto.map(accessToken, validEmail);
  }

  @Get('verify/:token')
  @ApiOperation({ summary: 'Veirfy e-mail' })
  @ApiOkResponse({ description: 'E-mail verified' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async verifyEmail(
    @Param('token') token: string,
  ): Promise<TokenVerifyResponseDto> {
    try {
      const isVerified = await this.authService.verifyEmail(token);
      return isVerified
        ? { message: 'E-mail verified', statusCode: 200 }
        : { message: 'Error while verifying e-mail', statusCode: 500 };
    } catch (error) {
      return { message: error.message, statusCode: error.statusCode };
    }
  }

  @Delete('delete')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Deletes user and their URLs from the database' })
  @ApiOkResponse({ description: 'User deleted' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async deleteUser(@GetUser() user: UserEntity) {
    try {
      const isDeleted = await this.authService.deleteUser(user);
      return isDeleted
        ? { message: 'User deleted', statusCode: 200 }
        : {
            message: 'Error while deleting user',
            statusCode: 500,
          };
    } catch (error) {
      return { message: error.message, statusCode: error.statusCode };
    }
  }
}
