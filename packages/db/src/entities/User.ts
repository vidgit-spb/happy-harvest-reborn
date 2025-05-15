import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Garden } from './Garden';
import { GardenMember } from './GardenMember';
import { QuestProgress } from './QuestProgress';
import { InviteBonus } from './InviteBonus';
import { StarTransaction } from './StarTransaction';
import { Purchase } from './Purchase';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  tgId: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  xp: number;

  @Column({ default: 100 })
  coins: number;

  @Column({ default: 0 })
  stars: number;

  @Column({ nullable: true })
  referrerId: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @OneToMany(() => Garden, garden => garden.owner)
  gardens: Garden[];

  @OneToMany(() => GardenMember, gardenMember => gardenMember.user)
  gardenMemberships: GardenMember[];

  @OneToMany(() => QuestProgress, questProgress => questProgress.user)
  questProgresses: QuestProgress[];

  @OneToMany(() => InviteBonus, inviteBonus => inviteBonus.user)
  inviteBonuses: InviteBonus[];

  @OneToMany(() => StarTransaction, starTransaction => starTransaction.user)
  starTransactions: StarTransaction[];

  @OneToMany(() => Purchase, purchase => purchase.user)
  purchases: Purchase[];
}
