import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('policy_chunks')
export class PolicyChunk {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  documentName!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  section!: string | null;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'vector', length: 3072 })
  embedding!: number[];

  @CreateDateColumn()
  createdAt!: Date;
}
