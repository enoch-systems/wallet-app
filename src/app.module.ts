import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletModule } from './wallet/wallet.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';

const databaseUrl = process.env.DATABASE_URL;

@Module({
  imports: [
    TypeOrmModule.forRoot(
      databaseUrl
        ? {
            type: 'postgres',
            url: databaseUrl,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            ssl: { rejectUnauthorized: false },
          }
        : {
            type: 'better-sqlite3',
            database: 'wallet.db',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
          },
    ),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    AuthModule,
    WalletModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
