import { Injectable, BadRequestException, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Wallet } from './wallet.entity';
import { Transaction } from './transaction.entity';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../notification/notification.service';
import { User } from '../user/user.entity';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private dataSource: DataSource,
    private authService: AuthService,
    private notificationService: NotificationService,
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

      this.sendReceiptEmail(userId, 'DEPOSIT', amount, reference, Number(wallet.balance));

      return { balance: Number(wallet.balance), reference };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async send(userId: number, amount: number, recipient: string, pin: string): Promise<{ balance: number; reference: string }> {
    const valid = await this.authService.verifyPin(userId, pin);
    if (!valid) {
      throw new UnauthorizedException('Invalid PIN');
    }

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

      this.sendReceiptEmail(userId, 'SEND', amount, reference, Number(wallet.balance));

      return { balance: Number(wallet.balance), reference };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async withdraw(userId: number, amount: number, pin: string): Promise<{ balance: number; reference: string }> {
    const valid = await this.authService.verifyPin(userId, pin);
    if (!valid) {
      throw new UnauthorizedException('Invalid PIN');
    }

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

      this.sendReceiptEmail(userId, 'WITHDRAW', amount, reference, Number(wallet.balance));

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

  private async sendReceiptEmail(userId: number, type: string, amount: number, reference: string, balance: number) {
    try {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) return;
      await this.notificationService.sendTransactionReceipt(user.email, user.name, type, amount, reference, balance);
    } catch (error: any) {
      this.logger.warn(`Failed to send receipt email: ${error.message}`);
    }
  }
}
