import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  SignInCredentialsDto,
  SignUpCredentialsDto,
} from './dto/auth-credentials.dto';
import { SignInResponseDto } from './dto/sign-in-response.dto';
import { EmailVerificationEntity } from './email-verification.entity';
import { JwtPayload } from './jwt-payload.interface';
import { UserEntity } from './user.entity';

@Injectable()
export class AuthService {
  private logger = new Logger();
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(EmailVerificationEntity)
    private readonly emailVerificationRepo: Repository<EmailVerificationEntity>,
    // this service is exported by JwtModule, used to sign tokens
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async createEmailToken(email: string): Promise<boolean> {
    let emailVerification = await this.emailVerificationRepo.findOneBy({
      email,
    });
    if (
      emailVerification &&
      new Date().getTime() - emailVerification.timestamp.getTime() / 60000 < 15
    ) {
      throw new InternalServerErrorException('Login e-mail sent recently');
    } else {
      emailVerification = await this.emailVerificationRepo.save({
        email: email,
        emailToken: uuidv4(),
        timestamp: new Date(),
      });
      this.logger.verbose(`Token for e-mail ${email} created`);
      return true;
    }
  }

  async sendEmailVerification(email: string): Promise<boolean> {
    const emailVerification = await this.emailVerificationRepo.findOneBy({
      email,
    });

    if (emailVerification && emailVerification.emailToken) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.configService.get('GMAIL_EMAIL'),
          pass: this.configService.get('GMAIL_PASS'),
        },
      });

      const mailOptions = {
        from: this.configService.get('GMAIL_EMAIL'),
        to: email,
        subject: 'Verify your e-mail',
        text: 'Verify your e-mail',
        html:
          '<h1>Hello!</h1> <p>Thank you for your registration.</p> ' +
          `<a href="${this.configService.get(
            'BASE_URL',
          )}:${this.configService.get('CLIENT_PORT')}/verify/${
            emailVerification.emailToken
          }">Click here to verify</a>`,
      };

      const sent = await new Promise<boolean>(async function (resolve, reject) {
        return await transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            console.log('Message sent: ', error);
            this.logger.verbose(
              `Failed to send e-mail verification link for ${email}`,
            );
            return reject(false);
          }
          console.log('Message sent: ', info.messageId);
          console.log('Message preview: ', nodemailer.getTestMessageUrl(info));

          resolve(true);
        });
      });
      this.logger.verbose(`E-mail verification link for ${email} sent`);
      return sent;
    } else {
      this.logger.verbose(`User ${email} not found or missing e-mail token`);
      throw new ForbiddenException();
    }
  }

  async verifyEmail(token: string): Promise<boolean> {
    const emailVerification = await this.emailVerificationRepo.findOneBy({
      emailToken: token,
    });
    if (emailVerification && emailVerification.email) {
      const userFromDb = await this.userRepo.findOneBy({
        email: emailVerification.email,
      });
      if (userFromDb) {
        userFromDb.validEmail = true;
        const savedUser = await this.userRepo.save(userFromDb);
        await this.emailVerificationRepo.remove(emailVerification);
        this.logger.verbose(
          `E-mail verified for user with e-mail token ${token}`,
        );
        return !!savedUser;
      } else {
        this.logger.verbose(
          `User with e-mail token ${token} not found in the database`,
        );
        throw new NotFoundException('User not found');
      }
    }
  }

  async signUp(
    signUpCredentialsDto: SignUpCredentialsDto,
  ): Promise<UserEntity> {
    const { firstName, lastName, email, username, password, validEmail } =
      signUpCredentialsDto;

    const userRegistered = await this.userRepo.findOneBy({ email });
    if (!userRegistered) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = this.userRepo.create({
        firstName,
        lastName,
        email,
        username,
        validEmail,
        password: hashedPassword,
      });
      try {
        const usernameExists = await this.userRepo.findOneBy({ username });
        if (usernameExists) {
          this.logger.verbose(`Username ${user.username} already in use`);
          throw new ConflictException('Username already in use');
        }

        const savedUser = await this.userRepo.save(user);
        this.logger.verbose(`User ${user.username} signed up successfully`);
        return savedUser;
      } catch (error) {
        this.logger.error(`User ${user.username} failed to sign up`);
        throw new InternalServerErrorException();
      }
    } else {
      throw new ConflictException('E-mail already in use');
    }
  }

  async signIn(
    signInCredentialsDto: SignInCredentialsDto,
  ): Promise<SignInResponseDto> {
    const { username, password } = signInCredentialsDto;
    const user = await this.userRepo.findOneBy({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = { username };
      const accessToken: string = await this.jwtService.sign(payload);
      const validEmail = user.validEmail;
      this.logger.verbose(`User ${username} successfully signed in`);
      return { accessToken, validEmail };
    } else {
      this.logger.error(`User ${username} failed to sign in`);
      throw new UnauthorizedException('Please check your credentials');
    }
  }

  async deleteUser(user: UserEntity): Promise<boolean> {
    try {
      await this.userRepo.delete(user);
      this.logger.verbose(`User ${user.username} deleted from the database`);
      return true;
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
