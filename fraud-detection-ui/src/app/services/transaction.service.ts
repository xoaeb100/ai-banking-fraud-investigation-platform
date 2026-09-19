import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transaction.model';
@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly apiUrl = 'http://localhost:3000/transactions';

  constructor(private readonly http: HttpClient) {}

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getTransaction(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
