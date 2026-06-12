import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WalletService } from './wallet.service';
import { DepositDto, SendDto, WithdrawDto } from './dto/wallet.dto';

@Controller('wallet')
@UseGuards(AuthGuard('jwt'))
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  getBalance(@Req() req: any) {
    return this.walletService.getBalance(req.user.userId);
  }

  @Post('deposit')
  deposit(@Body() dto: DepositDto, @Req() req: any) {
    return this.walletService.deposit(req.user.userId, dto.amount);
  }

  @Post('send')
  send(@Body() dto: SendDto, @Req() req: any) {
    return this.walletService.send(req.user.userId, dto.amount, dto.recipient, dto.pin);
  }

  @Post('withdraw')
  withdraw(@Body() dto: WithdrawDto, @Req() req: any) {
    return this.walletService.withdraw(req.user.userId, dto.amount, dto.pin);
  }

  @Get('transactions')
  getTransactions(@Req() req: any) {
    return this.walletService.getTransactions(req.user.userId);
  }
}
