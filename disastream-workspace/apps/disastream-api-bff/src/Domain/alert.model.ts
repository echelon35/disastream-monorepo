import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.model';
import { Alea } from './alea.model';
import { ReportType } from './reportType.model';
import { Geometry } from 'geojson';
import { MailAlert } from './mailAlert.model';

export class AlertCriteria {
  aleaName: string;
  field: string;
  operator: string;
  value: number;
}

@Index(['name', 'userId'], { unique: true })
@Entity({ name: 'alerts' })
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User, (user) => user.id)
  user: User;
  @Column()
  userId: number;
  @Column()
  name: string;
  @Column({ type: 'bool', default: true })
  isActivate: boolean;
  @Column({ type: 'bool', default: false })
  isCountryShape: boolean;
  @Column({ type: 'geometry', nullable: true })
  areas: Geometry;
  @ManyToMany(() => Alea)
  @JoinTable({ name: 'alerts_aleas' })
  aleas: Alea[];
  @Column({ type: 'json', nullable: true })
  criterias: AlertCriteria[];
  @OneToMany(() => ReportType, (reportType) => reportType.id)
  @JoinColumn({ name: 'reportTypes' })
  reportTypes: ReportType;
  @ManyToMany(() => MailAlert)
  @JoinTable({ name: 'alerts_mails' })
  mailAlerts: MailAlert[];
  @CreateDateColumn({
    type: 'timestamp without time zone',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;
  @Column({ type: 'timestamp without time zone', nullable: true })
  expirationDate: Date;
  @Column({ nullable: true })
  countryId: number;
  @UpdateDateColumn({
    type: 'timestamp without time zone',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
  @DeleteDateColumn({
    type: 'timestamp without time zone',
    nullable: true,
    default: () => 'null',
  })
  deletedAt: Date;
}
