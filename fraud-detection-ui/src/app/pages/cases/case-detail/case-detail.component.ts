import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InvestigationCase } from '../../../models/investigation-case.model';
import { Alert } from '../../../models/alert.model';
import { Transaction } from '../../../models/transaction.model';

import { InvestigationCaseService } from '../../../services/investigation-case.service';
import { AlertService } from '../../../services/alert.service';
import { TransactionService } from '../../../services/transaction.service';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AiService } from '../../../services/ai.service';
import { InvestigationOutput } from '../../../models/investigation-output.model';
@Component({
  selector: 'app-case-detail',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    TableModule,
    TagModule,
    ButtonModule,
  ],
  templateUrl: './case-detail.component.html',
  styleUrl: './case-detail.component.css',
})
export class CaseDetailComponent implements OnInit {
  caseData: InvestigationCase | null = null;
  alert: Alert | null = null;
  transaction: Transaction | null = null;

  loading = true;
  investigation: InvestigationOutput | null = null;
  investigating = false;
  investigationError = false;
  constructor(
    private readonly route: ActivatedRoute,
    private readonly caseService: InvestigationCaseService,
    private readonly alertService: AlertService,
    private readonly transactionService: TransactionService,
    private readonly aiService: AiService,
  ) {}

  ngOnInit(): void {
    const caseId = this.route.snapshot.paramMap.get('id');

    if (!caseId) {
      this.loading = false;
      return;
    }

    this.loadCase(caseId);
  }

  private loadCase(caseId: string): void {
    this.caseService.getCase(caseId).subscribe({
      next: (caseData) => {
        this.caseData = caseData;

        this.loadAlert(caseData.alertId);
        this.loadTransaction(caseData.transactionId);
      },
      error: (error) => {
        console.error('Failed to load investigation case', error);
        this.loading = false;
      },
    });
  }

  private loadAlert(alertId: string): void {
    this.alertService.findOne(alertId).subscribe({
      next: (alert) => {
        this.alert = alert;
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Failed to load alert', error);
        this.checkLoadingComplete();
      },
    });
  }

  private loadTransaction(transactionId: string): void {
    this.transactionService.getTransaction(transactionId).subscribe({
      next: (transaction) => {
        this.transaction = transaction;
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Failed to load transaction', error);
        this.checkLoadingComplete();
      },
    });
  }

  private checkLoadingComplete(): void {
    if (this.alert && this.transaction) {
      this.loading = false;
    }
  }

  runInvestigation(): void {
    if (!this.caseData || !this.alert) {
      return;
    }

    this.investigating = true;
    this.investigationError = false;

    this.aiService
      .investigate({
        transactionId: this.caseData.transactionId,
        riskScore: this.alert.riskScore,
        riskLevel: this.alert.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH',
        reasons: this.alert.reasons,
      })
      .subscribe({
        next: (result) => {
          this.investigation = result;
          this.investigating = false;
        },
        error: (error) => {
          console.error('AI investigation failed', error);
          this.investigating = false;
          this.investigationError = true;
        },
      });
  }
}
