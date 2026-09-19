import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Alert } from '../../models/alert.model';
import { AlertService } from '../../services/alert.service';
import { DatePipe, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-cases',
  imports: [TableModule, TagModule, SlicePipe, RouterLink, DatePipe],
  templateUrl: './cases.component.html',
  styleUrl: './cases.component.css',
})
export class CasesComponent implements OnInit {
  alerts: Alert[] = [];
  loading = false;

  constructor(private readonly alertService: AlertService) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.loading = true;

    this.alertService.getAlerts().subscribe({
      next: (alerts) => {
        this.alerts = alerts;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load alerts', error);
        this.loading = false;
      },
    });
  }
}
