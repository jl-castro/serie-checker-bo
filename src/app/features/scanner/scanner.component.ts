import { NgClass, NgSwitch, NgSwitchCase } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { ScanResult } from '../../core/models/scan-result.model';
import { ResultCardComponent } from '../../shared/components/result-card/result-card.component';
import { CameraPanelComponent } from './panels/camera-panel/camera-panel.component';
import { ManualPanelComponent } from './panels/manual-panel/manual-panel.component';
import { VoicePanelComponent } from './panels/voice-panel/voice-panel.component';

type ScannerMode = 'manual' | 'camera' | 'voice';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [
    NgClass,
    NgSwitch,
    NgSwitchCase,
    ManualPanelComponent,
    CameraPanelComponent,
    VoicePanelComponent,
    ResultCardComponent
  ],
  templateUrl: './scanner.component.html',
  styleUrl: './scanner.component.css'
})
export class ScannerComponent {
  readonly mode = signal<ScannerMode>('manual');
  readonly currentResult = signal<ScanResult>({
    input: '',
    series: 'B',
    denominationSelected: 'AUTO',
    status: 'UNKNOWN',
    timestamp: Date.now(),
    message: 'Ingresa un número para verificar.'
  });

  readonly modeOptions: Array<{ key: ScannerMode; label: string }> = [
    { key: 'manual', label: 'Manual' },
    { key: 'camera', label: 'Cámara' },
    { key: 'voice', label: 'Voz' }
  ];

  readonly mockResult: ScanResult = {
    input: '00000000 B',
    series: 'B',
    serialNumber: 0,
    serialNormalized: '000000000',
    denominationSelected: 'AUTO',
    timestamp: Date.now(),
    status: 'UNKNOWN' as const,
    message: 'Aún no se realizó ninguna verificación.'
  };

  readonly displayedResult = computed(() =>
    this.mode() === 'manual' ? this.currentResult() : this.mockResult
  );

  setMode(mode: ScannerMode): void {
    this.mode.set(mode);
  }

  onManualResult(result: ScanResult): void {
    this.currentResult.set(result);
  }
}
