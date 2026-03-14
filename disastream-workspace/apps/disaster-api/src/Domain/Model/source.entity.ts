import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sources')
@ObjectType()
export class Source {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;
  @Column()
  name: string;
  @Column()
  adress: string;
}
