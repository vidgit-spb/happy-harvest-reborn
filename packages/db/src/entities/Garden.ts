import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { GardenMember } from './GardenMember';
import { Plot } from './Plot';
import { Tree } from './Tree';
import { Animal } from './Animal';
import { Building } from './Building';

@Entity('gardens')
export class Garden {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  ownerId: string;

  @Column({ default: 6 })
  width: number;

  @Column({ default: 15 })
  height: number;

  @Column({ default: false })
  hasDog: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  dogFedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.gardens)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @OneToMany(() => GardenMember, gardenMember => gardenMember.garden)
  members: GardenMember[];

  @OneToMany(() => Plot, plot => plot.garden)
  plots: Plot[];

  @OneToMany(() => Tree, tree => tree.garden)
  trees: Tree[];

  @OneToMany(() => Animal, animal => animal.garden)
  animals: Animal[];

  @OneToMany(() => Building, building => building.garden)
  buildings: Building[];
}
