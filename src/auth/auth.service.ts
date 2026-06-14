import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(name: string, phone: string, password: string) {
    const existing = await this.userRepo.findOne({ where: { phone } });
    if (existing) {
      throw new ConflictException('Phone number already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userCount = await this.userRepo.count();
    const isAdmin = userCount === 0;
    const user = this.userRepo.create({ name, phone, password: hashedPassword, isAdmin });
    await this.userRepo.save(user);

    const token = this.jwtService.sign({ userId: user.id, phone: user.phone });

    return {
      token,
      user: { id: user.id, name: user.name, phone: user.phone, isAdmin: user.isAdmin },
    };
  }

  async login(phone: string, password: string) {
    const user = await this.userRepo.findOne({ where: { phone } });
    if (!user) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    const token = this.jwtService.sign({ userId: user.id, phone: user.phone });

    return {
      token,
      user: { id: user.id, name: user.name, phone: user.phone, isAdmin: user.isAdmin },
    };
  }

  async setPin(userId: number, pin: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const hashedPin = await bcrypt.hash(pin, 10);
    user.pin = hashedPin;
    await this.userRepo.save(user);

    return { message: 'PIN set successfully' };
  }

  async verifyPin(userId: number, pin: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.pin) {
      return false;
    }
    return bcrypt.compare(pin, user.pin);
  }
}