import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.model';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  username: string;
  @Column({ unique: true })
  mail: string;
  @Column({ nullable: true })
  password: string;
  @Column({ type: 'timestamp without time zone', default: new Date() })
  last_connexion: Date;
  @Column({ nullable: true })
  firstname: string;
  @Column({ nullable: true })
  lastname: string;
  @Column({ default: 'LOCAL' })
  provider: string;
  @Column({ nullable: true })
  providerId: string;
  @Column({ nullable: true })
  avatar: string;
  @Column({ default: false })
  isEmailVerified: boolean;
  @ManyToMany(() => Role)
  @JoinTable({ name: 'roles_users' })
  roles: Role[];
  @Column({ default: false })
  rgpdConsent: boolean;
  @Column({ default: false })
  allowMarketing: boolean;
}
