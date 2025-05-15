import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

@Entity('quest_progress')
export class QuestProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  userId: string;

  @Column({ nullable: false })
  questId: string;

  @Column({ default: 0 })
  progress: number;

  @Column({ default: false })
  completed: boolean;

  @Column({ nullable: true, type: 'jsonb' })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.questProgresses)
  @JoinColumn({ name: 'userId' })
  user: User;
}
