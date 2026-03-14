import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.model';
import { Criterion } from './criterion.model';
import { OneToMany } from 'typeorm';

@Entity({ name: 'aleas' })
export class Alea {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  label: string;
  @ManyToOne(() => Category, (category) => category.id)
  @JoinColumn({ name: 'category' })
  category: Category;

  @OneToMany(() => Criterion, (criterion) => criterion.alea)
  criterias: Criterion[];
}
