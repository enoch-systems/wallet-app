import { Injectable, ConflictException, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(name: string, phone: string, password: string) {
    try {
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
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      this.logger.error('Registration failed', error);
      throw new BadRequestException('Registration failed. Please try again.');
    }
  }

  async login(phone: string, password: string) {
    try {
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
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error('Login failed', error);
      throw new BadRequestException('Login failed. Please check your connection and try again.');
    }
  }

  async setPin(userId: number, pin: string) {
    try {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const hashedPin = await bcrypt.hash(pin, 10);
      user.pin = hashedPin;
      await this.userRepo.save(user);

      return { message: 'PIN set successfully' };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error('Set PIN failed', error);
      throw new BadRequestException('Failed to set PIN. Please try again.');
    }
  }

  async verifyPin(userId: number, pin: string): Promise<boolean> {
    try {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user || !user.pin) {
        return false;
      }
      return bcrypt.compare(pin, user.pin);
    } catch (error) {
      this.logger.error('PIN verification failed', error);
      return false;
    }
  }
}
