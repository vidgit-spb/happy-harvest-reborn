import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Garden } from './Garden';

@Entity('trees')
export class Tree {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  gardenId: string;

  @Column({ nullable: false })
  treeType: string;

  @Column()
  x: number;

  @Column()
  y: number;

  @CreateDateColumn()
  plantedAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  lastHarvestAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  // Relations
  @ManyToOne(() => Garden, garden => garden.trees)
  @JoinColumn({ name: 'gardenId' })
  garden: Garden;
}
