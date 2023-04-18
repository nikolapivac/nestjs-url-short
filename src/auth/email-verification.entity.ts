import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class EmailVerificationEntity {
  @PrimaryColumn()
  email: string;

  @Column()
  emailToken: string;

  @Column()
  timestamp: Date;
}
