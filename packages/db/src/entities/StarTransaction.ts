import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User';

export enum TransactionType {
  PURCHASE = 'purchase',
  REFUND = 'refund',
  PAYOUT = 'payout',
  GIFT = 'gift'
}

@Entity('star_transactions')
export class StarTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  userId: string;

  @Column()
  stars: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  usd: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.PURCHASE
  })
  type: TransactionType;

  @Column({ type: 'jsonb', nullable: true })
  payloadJson: Record<string, any>;

  @Column({ nullable: true })
  invoiceId: string;

  @Column({ default: false })
  isProcessed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.starTransactions)
  @JoinColumn({ name: 'userId' })
  user: User;
}
