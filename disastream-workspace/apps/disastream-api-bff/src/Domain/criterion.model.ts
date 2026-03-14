import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Alea } from './alea.model';

@Entity({ name: 'criterias' })
export class Criterion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'float', nullable: true })
  min?: number;

  @Column({ type: 'float', nullable: true })
  max?: number;

  @ManyToOne(() => Alea, (alea) => alea.criterias)
  @JoinColumn({ name: 'alea' })
  alea: Alea;
}
