import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User';

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  userId: string;

  @Column({ nullable: false })
  skuId: string;

  @Column()
  stars: number;

  @Column({ default: false })
  delivered: boolean;

  @Column({ nullable: true, type: 'jsonb' })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.purchases)
  @JoinColumn({ name: 'userId' })
  user: User;
}
