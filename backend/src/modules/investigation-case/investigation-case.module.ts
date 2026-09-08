import { Module } from '@nestjs/common';
import { InvestigationCaseService } from './investigation-case.service';
import { InvestigationCaseController } from './investigation-case.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestigationCase } from './entities/investigation-case.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InvestigationCase])],
  providers: [InvestigationCaseService],
  exports: [InvestigationCaseService],
  controllers: [InvestigationCaseController],
})
export class InvestigationCaseModule {}
