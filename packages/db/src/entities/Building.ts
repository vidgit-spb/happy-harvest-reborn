import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Garden } from './Garden';

@Entity('buildings')
export class Building {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  gardenId: string;

  @Column({ nullable: false })
  type: string;

  @Column({ default: 1 })
  level: number;

  @Column()
  x: number;

  @Column()
  y: number;

  @Column({ nullable: true, type: 'jsonb' })
  data: Record<string, any>;

  @Column({ nullable: true, type: 'timestamp' })
  lastUsedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Garden, garden => garden.buildings)
  @JoinColumn({ name: 'gardenId' })
  garden: Garden;
}
