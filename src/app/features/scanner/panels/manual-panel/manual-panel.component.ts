import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScanResult } from '../../../../core/models/scan-result.model';
import { RangeService } from '../../../../core/services/range.service';
import { ValidationService } from '../../../../core/services/validation.service';

type DenominationSelection = 10 | 20 | 50;

@Component({
  selector: 'app-manual-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './manual-panel.component.html',
  styleUrl: './manual-panel.component.css'
})
export class ManualPanelComponent {
  serialInput = '';
  denominationSelected: DenominationSelection = 10;
  readonly denominationOptions: DenominationSelection[] = [10, 20, 50];
  @Output() result = new EventEmitter<ScanResult>();

  constructor(
    private readonly rangeService: RangeService,
    private readonly validationService: ValidationService
  ) {}

  verify(): void {
    this.rangeService.loadOnce().subscribe((ranges) => {
      const scanResult = this.validationService.validate(
        this.serialInput,
        ranges,
        this.denominationSelected
      );
      this.result.emit(scanResult);
    });
  }

  onSerialInputChange(value: string): void {
    this.serialInput = value.replace(/\D/g, '').slice(0, 9);
  }
}
