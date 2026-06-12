import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Wallet } from './wallet.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  walletId: number;

  @Column()
  type: string; // 'DEPOSIT' | 'SEND' | 'WITHDRAW'

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({ unique: true })
  reference: string;

  @Column({ nullable: true })
  counterparty: string;

  @Column({ default: 'COMPLETED' })
  status: string; // 'COMPLETED' | 'FAILED'

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Wallet, (wallet) => wallet.id)
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;
}