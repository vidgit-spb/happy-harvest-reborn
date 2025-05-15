import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Garden } from './Garden';

export enum MemberRole {
  OWNER = 'owner',
  MEMBER = 'member',
}

@Entity('garden_members')
export class GardenMember {
  @PrimaryColumn()
  userId: string;

  @PrimaryColumn()
  gardenId: string;

  @Column({
    type: 'enum',
    enum: MemberRole,
    default: MemberRole.MEMBER
  })
  role: MemberRole;

  @CreateDateColumn()
  joinedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.gardenMemberships)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Garden, garden => garden.members)
  @JoinColumn({ name: 'gardenId' })
  garden: Garden;
}
