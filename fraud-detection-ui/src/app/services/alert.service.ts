import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Alert } from '../models/alert.model';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private readonly apiUrl = 'http://localhost:3000/alerts';

  constructor(private readonly http: HttpClient) {}

  getAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(this.apiUrl);
  }
  findOne(id: string): Observable<Alert> {
    return this.http.get<Alert>(`${this.apiUrl}/${id}`);
  }
}
