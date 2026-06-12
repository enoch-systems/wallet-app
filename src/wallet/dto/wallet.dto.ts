import { IsPositive, IsNumber, IsString, IsNotEmpty, Length } from 'class-validator';

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

  @IsString()
  @Length(4, 4)
  pin: string;
}

export class WithdrawDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @Length(4, 4)
  pin: string;
}
