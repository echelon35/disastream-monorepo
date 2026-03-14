import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'reportTypes' })
export class ReportType {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  type: string;
  @Column()
  label: string;
}
