import { IsPositive, IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class DepositDto {
  @IsNumber()
  @IsPositive()
  amount: number;
}

export class SendDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  recipient: string;
}

export class WithdrawDto {
  @IsNumber()
  @IsPositive()
  amount: number;
}