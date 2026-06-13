import { Controller, Get, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats(@Req() req: any) {
    if (!req.user.isAdmin) throw new UnauthorizedException('Admin access required');
    return this.adminService.getStats();
  }

  @Get('users')
  async getUsers(@Req() req: any) {
    if (!req.user.isAdmin) throw new UnauthorizedException('Admin access required');
    return this.adminService.getUsers();
  }

  @Get('transactions')
  async getTransactions(@Req() req: any) {
    if (!req.user.isAdmin) throw new UnauthorizedException('Admin access required');
    return this.adminService.getTransactions();
  }
}