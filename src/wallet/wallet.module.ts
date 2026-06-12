import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Wallet } from './wallet.entity';
import { Transaction } from './transaction.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Transaction]), AuthModule],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
