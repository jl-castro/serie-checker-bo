import { NgClass, NgSwitch, NgSwitchCase } from '@angular/common';
import { Component, signal } from '@angular/core';
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
  readonly currentResult = signal<ScanResult | null>(null);

  readonly modeOptions: Array<{ key: ScannerMode; label: string }> = [
    { key: 'manual', label: 'Manual' },
    { key: 'camera', label: 'Cámara' },
    { key: 'voice', label: 'Voz' }
  ];

  setMode(mode: ScannerMode): void {
    this.mode.set(mode);
  }

  onManualResult(result: ScanResult): void {
    this.currentResult.set(result);
  }

  onVoiceResult(result: ScanResult): void {
    this.currentResult.set(result);
  }
}
