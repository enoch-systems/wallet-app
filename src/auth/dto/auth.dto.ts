import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  @Matches(/^\d+$/, { message: 'Phone must contain only digits' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^\d+$/, { message: 'Password must be exactly 6 digits' })
  password: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  @Matches(/^\d+$/, { message: 'Phone must contain only digits' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^\d+$/, { message: 'Password must be exactly 6 digits' })
  password: string;
}

export class SetPinDto {
  @IsString()
  @Length(4, 4)
  @Matches(/^\d+$/, { message: 'PIN must be exactly 4 digits' })
  pin: string;
}