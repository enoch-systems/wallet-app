import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Wallet } from './wallet.entity';
import { Transaction } from './transaction.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    private dataSource: DataSource,
  ) {}

  async getOrCreateWallet(userId: number): Promise<Wallet> {
    let wallet = await this.walletRepo.findOne({ where: { userId } });
    if (!wallet) {
      wallet = this.walletRepo.create({ userId, balance: 0, currency: 'NGN' });
      wallet = await this.walletRepo.save(wallet);
    }
    return wallet;
  }

  async getBalance(userId: number): Promise<{ balance: number; currency: string }> {
    const wallet = await this.getOrCreateWallet(userId);
    return { balance: Number(wallet.balance), currency: wallet.currency };
  }

  async deposit(userId: number, amount: number): Promise<{ balance: number; reference: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let wallet = await queryRunner.manager.findOne(Wallet, { where: { userId } });
      if (!wallet) {
        wallet = queryRunner.manager.create(Wallet, { userId, balance: 0, currency: 'NGN' });
        wallet = await queryRunner.manager.save(wallet);
      }

      wallet.balance = Number(wallet.balance) + amount;
      await queryRunner.manager.save(wallet);

      const reference = uuidv4();
      const transaction = queryRunner.manager.create(Transaction, {
        wallet: wallet,
        type: 'DEPOSIT',
        amount,
        reference,
        status: 'COMPLETED',
      });
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return { balance: Number(wallet.balance), reference };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async send(userId: number, amount: number, recipient: string): Promise<{ balance: number; reference: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let wallet = await queryRunner.manager.findOne(Wallet, { where: { userId } });
      if (!wallet) {
        throw new NotFoundException('Wallet not found. Deposit money first.');
      }

      const currentBalance = Number(wallet.balance);
      if (currentBalance < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      wallet.balance = currentBalance - amount;
      await queryRunner.manager.save(wallet);

      const reference = uuidv4();
      const transaction = queryRunner.manager.create(Transaction, {
        wallet: wallet,
        type: 'SEND',
        amount,
        reference,
        counterparty: recipient,
        status: 'COMPLETED',
      });
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return { balance: Number(wallet.balance), reference };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async withdraw(userId: number, amount: number): Promise<{ balance: number; reference: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let wallet = await queryRunner.manager.findOne(Wallet, { where: { userId } });
      if (!wallet) {
        throw new NotFoundException('Wallet not found. Deposit money first.');
      }

      const currentBalance = Number(wallet.balance);
      if (currentBalance < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      wallet.balance = currentBalance - amount;
      await queryRunner.manager.save(wallet);

      const reference = uuidv4();
      const transaction = queryRunner.manager.create(Transaction, {
        wallet: wallet,
        type: 'WITHDRAW',
        amount,
        reference,
        status: 'COMPLETED',
      });
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return { balance: Number(wallet.balance), reference };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    const wallet = await this.walletRepo.findOne({ where: { userId } });
    if (!wallet) return [];
    return this.transactionRepo.find({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
    });
  }
}