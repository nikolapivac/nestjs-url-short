import { Exclude } from 'class-transformer';
import { UserEntity } from 'src/auth/user.entity';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class UrlEntity {
  @PrimaryColumn()
  urlCode: string;

  @Column()
  longUrl: string;

  @Column()
  shortUrl: string;

  @ManyToOne(() => UserEntity, (user) => user.urls)
  @Exclude({ toPlainOnly: true })
  user: UserEntity;
}
