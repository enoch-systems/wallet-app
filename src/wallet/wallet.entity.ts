import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ default: 'NGN' })
  currency: string;

  @CreateDateColumn()
  createdAt: Date;
}
