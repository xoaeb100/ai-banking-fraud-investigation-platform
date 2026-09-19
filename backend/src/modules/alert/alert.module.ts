import { Module } from '@nestjs/common';
import { AlertService } from './alert.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from './entities/alert.entity';
import { InvestigationCaseModule } from '../investigation-case/investigation-case.module';
import { AlertController } from './alert.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Alert]), InvestigationCaseModule],
  providers: [AlertService],
  controllers: [AlertController],

  exports: [AlertService],
})
export class AlertModule {}
