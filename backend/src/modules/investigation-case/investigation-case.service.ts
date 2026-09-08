import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InvestigationCase } from './entities/investigation-case.entity';
import { InvestigationCaseStatus } from './enums/investigation-case-status.enum';

@Injectable()
export class InvestigationCaseService {
  constructor(
    @InjectRepository(InvestigationCase)
    private readonly caseRepository: Repository<InvestigationCase>,
  ) {}

  async createCase(
    alertId: string,
    transactionId: string,
    customerId: string,
  ): Promise<InvestigationCase> {
    const investigationCase = this.caseRepository.create({
      alertId,
      transactionId,
      customerId,
    });

    return this.caseRepository.save(investigationCase);
  }

  async getAllCases(): Promise<InvestigationCase[]> {
    return this.caseRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getCaseById(id: string): Promise<InvestigationCase | null> {
    return this.caseRepository.findOne({
      where: { id },
    });
  }

  async updateStatus(
    id: string,
    status: InvestigationCaseStatus,
  ): Promise<InvestigationCase | null> {
    await this.caseRepository.update({ id }, { status });

    return this.getCaseById(id);
  }

  async assignCase(
    id: string,
    assignedTo: string,
  ): Promise<InvestigationCase | null> {
    await this.caseRepository.update({ id }, { assignedTo });

    return this.getCaseById(id);
  }
}
