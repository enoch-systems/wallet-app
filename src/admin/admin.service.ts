import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Transaction } from '../wallet/transaction.entity';
import { Wallet } from '../wallet/wallet.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
  ) {}

  async getStats() {
    const userCount = await this.userRepo.count();
    const transactionCount = await this.transactionRepo.count();
    const wallets = await this.walletRepo.find();
    const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    return { userCount, transactionCount, totalBalance };
  }

  async getUsers() {
    const users = await this.userRepo.find({
      order: { createdAt: 'DESC' },
    });
    const wallets = await this.walletRepo.find();
    return users.map(user => {
      const wallet = wallets.find(w => w.userId === user.id);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        balance: wallet ? Number(wallet.balance) : 0,
        createdAt: user.createdAt,
      };
    });
  }

  async getWallets() {
    const wallets = await this.walletRepo.find();
    const users = await this.userRepo.find();
    return wallets.map(wallet => {
      const user = users.find(u => u.id === wallet.userId);
      return {
        id: wallet.id,
        userId: wallet.userId,
        userName: user ? user.name : 'Unknown',
        balance: Number(wallet.balance),
        currency: wallet.currency,
      };
    });
  }

  async getTransactions() {
    return this.transactionRepo.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
