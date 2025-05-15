import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User';

@Entity('invite_bonuses')
export class InviteBonus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  userId: string;

  @Column({ default: 2 })
  multiplier: number;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ nullable: true })
  reason: string;

  @Column({ default: false })
  isConsumed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.inviteBonuses)
  @JoinColumn({ name: 'userId' })
  user: User;
}
