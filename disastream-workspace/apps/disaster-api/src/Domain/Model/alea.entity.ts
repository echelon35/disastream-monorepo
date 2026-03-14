import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'aleas' })
@ObjectType({ description: 'Alea types availables on the db' })
export class Alea {
  @PrimaryGeneratedColumn()
  @Field(() => ID, { description: 'ID of an alea' })
  id: number;
  @Column()
  name: string;
  @Column()
  legend: string;
  @Column({ default: true })
  disponible: boolean;
  @Column({ type: 'json' })
  keywords: string[];
}
