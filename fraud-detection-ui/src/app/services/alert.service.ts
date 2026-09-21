import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Alert } from '../models/alert.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}/alerts`;

  constructor(private readonly http: HttpClient) {}

  getAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(this.apiUrl);
  }
  findOne(id: string): Observable<Alert> {
    return this.http.get<Alert>(`${this.apiUrl}/${id}`);
  }
}
