import { IsEmail } from 'class-validator';
import { UrlEntity } from 'src/url/url.entity';
import {
  Column,
  Entity,
  Generated,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  @Generated('uuid')
  emailToken: string;

  @Column({ default: false })
  validEmail: boolean;

  @OneToMany(() => UrlEntity, (url) => url.user, { cascade: true })
  urls: UrlEntity[];
}
