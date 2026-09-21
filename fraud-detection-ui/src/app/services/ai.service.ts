import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { InvestigationOutput } from '../models/investigation-output.model';
import { API_CONFIG } from '../config/api.config';

export interface InvestigationInput {
  transactionId: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  reasons: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}/ai`;

  constructor(private readonly http: HttpClient) {}

  investigate(input: InvestigationInput): Observable<InvestigationOutput> {
    return this.http.post<InvestigationOutput>(
      `${this.apiUrl}/investigate`,
      input,
    );
  }
}
