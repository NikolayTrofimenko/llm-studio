import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type EmailTokenType = 'verify' | 'reset';

@Entity('email_tokens')
export class EmailToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  tokenHash!: string;

  @Column({ type: 'varchar' })
  type!: EmailTokenType;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  usedAt?: Date;

  @ManyToOne(() => User, (user) => user.emailTokens, {
    onDelete: 'CASCADE',
  })
  user!: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}

