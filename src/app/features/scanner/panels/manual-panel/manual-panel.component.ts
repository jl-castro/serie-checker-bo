import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScanResult } from '../../../../core/models/scan-result.model';
import { RangeService } from '../../../../core/services/range.service';
import { ValidationService } from '../../../../core/services/validation.service';

type DenominationSelection = 10 | 20 | 50;
type DenominationPalette = {
  light: string;
  mid: string;
  deep: string;
  text: string;
};

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
  readonly denominationPalette: Record<DenominationSelection, DenominationPalette> = {
    10: { light: '#d8f3ff', mid: '#5bb8da', deep: '#0b5f87', text: '#0a4f70' },
    20: { light: '#ffe8ce', mid: '#f2a255', deep: '#a14d0d', text: '#8f430a' },
    50: { light: '#f4e5f4', mid: '#be86b8', deep: '#704069', text: '#64355e' }
  };
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

  get selectedTone(): DenominationPalette {
    return this.denominationPalette[this.denominationSelected];
  }
}
