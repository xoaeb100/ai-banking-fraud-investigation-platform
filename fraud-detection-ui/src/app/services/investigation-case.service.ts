import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { InvestigationCase } from '../models/investigation-case.model';

@Injectable({
  providedIn: 'root',
})
export class InvestigationCaseService {
  private readonly apiUrl = 'http://localhost:3000/investigation-cases';

  constructor(private readonly http: HttpClient) {}

  getCases(): Observable<InvestigationCase[]> {
    return this.http.get<InvestigationCase[]>(this.apiUrl);
  }

  getCase(id: string): Observable<InvestigationCase> {
    return this.http.get<InvestigationCase>(`${this.apiUrl}/${id}`);
  }
}
