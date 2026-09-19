import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
@Component({
  selector: 'app-transaction-details',
  imports: [CommonModule, CardModule, TagModule],
  templateUrl: './transaction-details.component.html',
  styleUrl: './transaction-details.component.css',
})
export class TransactionDetailsComponent implements OnInit {
  transaction: Transaction | null = null;

  loading = false;
  error = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly transactionService: TransactionService,
  ) {}

  ngOnInit(): void {
    const transactionId = this.route.snapshot.paramMap.get('id');

    if (!transactionId) {
      this.error = 'Transaction ID is missing';
      return;
    }

    this.loadTransaction(transactionId);
  }

  loadTransaction(id: string): void {
    this.loading = true;

    this.transactionService.getTransaction(id).subscribe({
      next: (transaction) => {
        this.transaction = transaction;
        this.loading = false;
      },

      error: (error) => {
        console.error('Failed to load transaction', error);

        this.error = 'Transaction could not be loaded';
        this.loading = false;
      },
    });
  }
}
