import { IsEmail, IsString, IsNotEmpty, MinLength, Length } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class SetPinDto {
  @IsString()
  @Length(4, 4)
  pin: string;
}
