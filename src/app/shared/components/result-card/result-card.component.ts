import { NgClass, UpperCasePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ScanStatus } from '../../../core/models/scan-result.model';

@Component({
  selector: 'app-result-card',
  standalone: true,
  imports: [NgClass, UpperCasePipe],
  templateUrl: './result-card.component.html',
  styleUrl: './result-card.component.css'
})
export class ResultCardComponent {
  @Input({ required: true }) status!: ScanStatus;
  @Input({ required: true }) series!: string;
  @Input() serialNormalized?: string;
  @Input() denominationMatched?: number;
  @Input({ required: true }) message!: string;

  get statusClass(): string {
    if (this.status === 'VALID') {
      return 'bg-emerald-100 text-emerald-800 ring-emerald-200';
    }

    if (this.status === 'INVALID') {
      return 'bg-rose-100 text-rose-800 ring-rose-200';
    }

    return 'bg-amber-100 text-amber-800 ring-amber-200';
  }
}
