import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Garden } from './Garden';

@Entity('animals')
export class Animal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  gardenId: string;

  @Column({ nullable: false })
  animalType: string;

  @Column()
  x: number;

  @Column()
  y: number;

  @Column({ nullable: true, type: 'timestamp' })
  fedAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  lastCollectAt: Date;

  @Column({ default: false })
  isPremium: boolean;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Garden, garden => garden.animals)
  @JoinColumn({ name: 'gardenId' })
  garden: Garden;
}
