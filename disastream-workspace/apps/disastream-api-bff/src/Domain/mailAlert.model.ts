import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.model';

@Index(['mail', 'userId'], { unique: true })
@Entity('mailAlerts')
export class MailAlert {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  mail: string;
  @ManyToOne(() => User, (user) => user.id)
  user: User;
  @Column()
  userId: number;
  @Column({ default: false })
  isVerified: boolean;
}
