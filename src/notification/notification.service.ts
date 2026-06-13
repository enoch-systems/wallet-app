import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService implements OnModuleInit {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(NotificationService.name);

  async onModuleInit() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.logger.log('Email transporter ready (Ethereal)');
    } catch {
      this.logger.warn('Email not configured - receipts will be skipped');
    }
  }

  async sendTransactionReceipt(
    email: string,
    name: string,
    type: string,
    amount: number,
    reference: string,
    balance: number,
  ) {
    if (!this.transporter) return { sent: false, error: 'Email not configured' };
    const isCredit = type === 'DEPOSIT';
    const emoji = isCredit ? '💰' : '💸';
    const color = isCredit ? '#10b981' : '#ef4444';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f8f9fa; padding: 32px;">
        <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <h1 style="text-align: center; font-size: 20px; color: #1a1a2e; margin-bottom: 4px;">Walleo</h1>
          <p style="text-align: center; color: #6b7280; font-size: 13px; margin-bottom: 24px;">Transaction Receipt</p>

          <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: ${color}15; display: inline-flex; align-items: center; justify-content: center; font-size: 24px;">
              ${emoji}
            </div>
            <h2 style="font-size: 14px; color: #6b7280; margin-top: 8px;">${type}</h2>
          </div>

          <div style="border-top: 1px solid #f0f0f0; padding-top: 16px; margin-bottom: 16px;">
            <p style="display: flex; justify-content: space-between; font-size: 13px; color: #6b7280; margin-bottom: 8px;">
              <span>Amount</span>
              <strong style="color: ${color};">₦${Number(amount).toLocaleString()}</strong>
            </p>
            <p style="display: flex; justify-content: space-between; font-size: 13px; color: #6b7280; margin-bottom: 8px;">
              <span>Reference</span>
              <strong style="font-family: monospace; font-size: 12px;">${reference}</strong>
            </p>
            <p style="display: flex; justify-content: space-between; font-size: 13px; color: #6b7280; margin-bottom: 8px;">
              <span>New Balance</span>
              <strong>₦${Number(balance).toLocaleString()}</strong>
            </p>
            <p style="display: flex; justify-content: space-between; font-size: 13px; color: #6b7280;">
              <span>Date</span>
              <span>${new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </p>
          </div>

          <p style="text-align: center; font-size: 11px; color: #9ca3af; margin-top: 16px;">
            This is a receipt from Walleo Wallet. Do not share this email.
          </p>
        </div>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: '"Walleo" <receipts@walleo.com>',
        to: email,
        subject: `${emoji} ${type} - ₦${Number(amount).toLocaleString()}`,
        html,
      });
      this.logger.log(`Email sent to ${email}: ${info.messageId}`);
      return { sent: true, messageId: info.messageId };
    } catch (error: any) {
      this.logger.warn(`Failed to send email to ${email}: ${error.message}`);
      return { sent: false, error: error.message };
    }
  }
}