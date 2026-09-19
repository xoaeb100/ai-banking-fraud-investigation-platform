import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';
import { CommonModule } from '@angular/common';

import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-transactions',
  imports: [CommonModule, TableModule, TagModule, ButtonModule, RouterLink],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css',
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];

  loading = false;
  error = '';

  constructor(private readonly transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.error = '';

    this.transactionService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.loading = false;
      },

      error: (error) => {
        console.error('Failed to load transactions', error);
        this.error = 'Failed to load transactions';
        this.loading = false;
      },
    });
  }

  getRiskSeverity(status: string) {
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
