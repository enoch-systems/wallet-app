import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'wallet-secret-key-change-in-production',
    });
  }

  async validate(payload: { userId: number; email: string }) {
    const user = await this.userRepo.findOne({ where: { id: payload.userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return { userId: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin };
  }
}
