import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import configuration from './config/configuration';
import { RolesModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MlModule } from './modules/ml/ml.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { FraudFeatureEngineeringModule } from './feature-engineering/fraud-feature-engineering.module';
import { RiskEngineModule } from './modules/risk-engine/risk-engine.module';
import { VelocityModule } from './modules/velocity/velocity.module';
import { FraudProcessingQueueModule } from './modules/fraud-processing-queue/fraud-processing-queue.module';
import { RedisModule } from './modules/redis/redis.module';
import { FraudProcessingModule } from './modules/fraud-processing/fraud-processing.module';
import { AlertModule } from './modules/alert/alert.module';
import { InvestigationCaseModule } from './modules/investigation-case/investigation-case.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'postgres',

        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),

        autoLoadEntities: true,

        synchronize: false,
      }),
    }),
    RolesModule,
    UsersModule,
    AuthModule,
    MlModule,
    TransactionModule,
    FraudFeatureEngineeringModule,
    RiskEngineModule,
    VelocityModule,
    FraudProcessingQueueModule,
    RedisModule,
    FraudProcessingModule,
    AlertModule,
    InvestigationCaseModule,
  ],
})
export class AppModule {}
