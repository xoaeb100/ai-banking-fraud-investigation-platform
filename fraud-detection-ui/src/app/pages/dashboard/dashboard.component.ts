import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    TableModule,
    TagModule,
    ButtonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  transactions: Transaction[] = [];

  loading = false;
  error = '';

  constructor(private readonly transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = '';

    this.transactionService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.loading = false;
      },

      error: (error) => {
        console.error('Failed to load dashboard data', error);

        this.error = 'Unable to load dashboard data';
        this.loading = false;
      },
    });
  }

  get totalTransactions(): number {
    return this.transactions.length;
  }

  get pendingTransactions(): number {
    return this.transactions.filter(
      (transaction) =>
        transaction.fraudDetectionStatus === 'PENDING' ||
        transaction.fraudDetectionStatus === 'YET_TO_PROCESS',
    ).length;
  }

  get processingTransactions(): number {
    return this.transactions.filter(
      (transaction) => transaction.fraudDetectionStatus === 'PROCESSING',
    ).length;
  }

  get completedTransactions(): number {
    return this.transactions.filter(
      (transaction) => transaction.fraudDetectionStatus === 'COMPLETED',
    ).length;
  }

  get recentTransactions(): Transaction[] {
    return this.transactions.slice(0, 5);
  }

  getStatusSeverity(status: string) {
    switch (status) {
      case 'COMPLETED':
        return 'success';

      case 'PROCESSING':
        return 'warn';

      case 'YET_TO_PROCESS':
        return 'danger';

      case 'PENDING':
        return 'secondary';

      default:
        return 'secondary';
    }
  }
}
