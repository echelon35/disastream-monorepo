import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Alert } from './alert.model';
import { DisasterDataFromSQS } from '../DTO/disasterDataFromSQS';

@Entity('historyAlerts')
export class AlertHistory {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Alert, (alert) => alert.id)
  alert: Alert;
  @Column()
  alertId: number;
  @Column({ type: 'json' })
  notification: JSON;
  @Column({ type: 'json' })
  disasterDataFromSQS: DisasterDataFromSQS;
  @CreateDateColumn({
    type: 'timestamp without time zone',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;
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
