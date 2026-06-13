import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../user/user.entity';
import { Transaction } from '../wallet/transaction.entity';
import { Wallet } from '../wallet/wallet.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Transaction, Wallet]), AuthModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}