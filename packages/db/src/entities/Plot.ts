import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Garden } from './Garden';

export enum PlotStage {
  EMPTY = 'empty',
  SEED = 'seed',
  SPROUT = 'sprout',
  MATURE = 'mature',
  HARVEST = 'harvest',
}

@Entity('plots')
export class Plot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  gardenId: string;

  @Column({ nullable: false })
  x: number;

  @Column({ nullable: false })
  y: number;

  @Column({ nullable: true })
  plantId: string;

  @Column({
    type: 'enum',
    enum: PlotStage,
    default: PlotStage.EMPTY
  })
  stage: PlotStage;

  @Column({ nullable: true, type: 'timestamp' })
  plantedAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  lastWateredAt: Date;

  @Column({ default: false })
  pest: boolean;

  @Column({ default: 0 })
  stolePercent: number;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Garden, garden => garden.plots)
  @JoinColumn({ name: 'gardenId' })
  garden: Garden;
}
