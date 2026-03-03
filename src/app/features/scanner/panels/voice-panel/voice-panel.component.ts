import { Component, EventEmitter, NgZone, OnDestroy, Output } from '@angular/core';
import { BillRange } from '../../../../core/models/range.model';
import { ScanResult } from '../../../../core/models/scan-result.model';
import { RangeService } from '../../../../core/services/range.service';
import { TranscriptNormalizerService } from '../../../../core/services/transcript-normalizer.service';
import { ValidationService } from '../../../../core/services/validation.service';
import {
  getPreferredSpeechLanguage,
  getSpeechRecognitionConstructor,
  SpeechRecognitionEventLike,
  SpeechRecognitionLike
} from '../../../../shared/utils/web-speech.util';

type DenominationOption = 10 | 20 | 50;

@Component({
  selector: 'app-voice-panel',
  standalone: true,
  templateUrl: './voice-panel.component.html',
  styleUrl: './voice-panel.component.css'
})
export class VoicePanelComponent implements OnDestroy {
  readonly denominationOptions: DenominationOption[] = [10, 20, 50];
  denominationSelected: DenominationOption = 10;
  transcript = '';
  normalizedTranscript = '';
  listening = false;
  starting = false;
  warmingUp = false;
  isSpeechUnsupported = false;
  @Output() result = new EventEmitter<ScanResult>();

  private recognition: SpeechRecognitionLike | null = null;
  private finalTranscript = '';
  private desiredListening = false;
  private stopFallbackTimer: ReturnType<typeof setTimeout> | null = null;
  private warmupTimer: ReturnType<typeof setTimeout> | null = null;
  private lastProcessedTranscript = '';

  constructor(
    private readonly ngZone: NgZone,
    private readonly rangeService: RangeService,
    private readonly validationService: ValidationService,
    private readonly transcriptNormalizer: TranscriptNormalizerService
  ) {
    this.initializeSpeechRecognition();
  }

  ngOnDestroy(): void {
    if (!this.recognition) {
      return;
    }

    this.recognition.onstart = null;
    this.recognition.onresult = null;
    this.recognition.onend = null;
    this.recognition.onerror = null;
    this.clearStopFallbackTimer();
    this.clearWarmupTimer();

    if (this.listening) {
      this.recognition.stop();
    }
  }

  toggleListening(): void {
    if (!this.recognition || this.isSpeechUnsupported) {
      return;
    }

    if (this.isVoiceActive) {
      this.desiredListening = false;
      this.clearWarmupTimer();
      this.warmingUp = false;
      try {
        if (this.listening || this.starting) {
          this.recognition.stop();
          this.scheduleStopFallback();
        }
      } catch {
        this.listening = false;
      }
      this.listening = false;
      this.starting = false;
      return;
    }

    this.finalTranscript = '';
    this.transcript = '';
    this.normalizedTranscript = '';
    this.lastProcessedTranscript = '';
    this.warmingUp = true;
    this.starting = false;
    this.desiredListening = true;
    this.listening = false;
    this.clearWarmupTimer();
    this.warmupTimer = setTimeout(() => {
      this.ngZone.run(() => {
        if (!this.recognition || !this.desiredListening) {
          this.warmingUp = false;
          return;
        }

        this.warmingUp = false;
        this.starting = true;
        try {
          this.recognition.start();
        } catch {
          this.desiredListening = false;
          this.listening = false;
          this.starting = false;
        }
      });
    }, 1000);
  }

  get isVoiceActive(): boolean {
    return this.warmingUp || this.listening || this.starting;
  }

  get buttonLabel(): string {
    if (this.warmingUp) {
      return 'Preparando...';
    }

    if (this.listening || this.starting) {
      return 'Detener';
    }

    return 'Iniciar voz';
  }

  private initializeSpeechRecognition(): void {
    const SpeechRecognitionConstructor = getSpeechRecognitionConstructor();

    if (!SpeechRecognitionConstructor) {
      this.isSpeechUnsupported = true;
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = getPreferredSpeechLanguage();
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onstart = () => {
      this.ngZone.run(() => {
        if (!this.desiredListening) {
          if (typeof recognition.abort === 'function') {
            recognition.abort();
          } else {
            recognition.stop();
          }
          this.listening = false;
          this.warmingUp = false;
          this.starting = false;
          return;
        }
        this.listening = true;
        this.starting = false;
      });
    };
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      this.ngZone.run(() => this.handleSpeechResult(event));
    };
    recognition.onend = () => {
      this.ngZone.run(() => {
        this.clearStopFallbackTimer();
        this.clearWarmupTimer();
        if (this.transcript && this.transcript !== this.lastProcessedTranscript) {
          this.processFinalTranscript(this.transcript);
        }
        this.desiredListening = false;
        this.listening = false;
        this.warmingUp = false;
        this.starting = false;
      });
    };
    recognition.onerror = (event: { error?: string }) => {
      this.ngZone.run(() => {
        if (event.error === 'language-not-supported' && recognition.lang !== 'es-ES') {
          recognition.lang = 'es-ES';
        }
        this.clearStopFallbackTimer();
        this.clearWarmupTimer();
        this.desiredListening = false;
        this.listening = false;
        this.warmingUp = false;
        this.starting = false;
      });
    };
    this.recognition = recognition;
  }

  private handleSpeechResult(event: SpeechRecognitionEventLike): void {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let index = 0; index < event.results.length; index += 1) {
      const recognitionResult = event.results[index];
      const chunk = recognitionResult[0]?.transcript ?? '';
      if (recognitionResult.isFinal) {
        finalTranscript += `${chunk} `;
      } else {
        interimTranscript += `${chunk} `;
      }
    }

    finalTranscript = finalTranscript.trim();
    interimTranscript = interimTranscript.trim();

    this.transcript = `${finalTranscript} ${interimTranscript}`.trim();

    if (finalTranscript) {
      this.processFinalTranscript(this.transcript);
    }
  }

  private processFinalTranscript(rawTranscript: string): void {
    this.lastProcessedTranscript = rawTranscript;
    const normalizedTranscript = this.transcriptNormalizer.normalizeToSerialInput(rawTranscript);
    this.normalizedTranscript = normalizedTranscript;

    this.rangeService.loadOnce().subscribe((ranges) => {
      this.ngZone.run(() => {
        const scanResult = this.resolveScanResult(normalizedTranscript, ranges);
        this.result.emit(scanResult);
      });
    });
  }

  private scheduleStopFallback(): void {
    this.clearStopFallbackTimer();
    this.stopFallbackTimer = setTimeout(() => {
      if (!this.recognition || this.desiredListening || !this.isVoiceActive) {
        return;
      }

      if (typeof this.recognition.abort === 'function') {
        this.recognition.abort();
      }
    }, 1200);
  }

  private clearStopFallbackTimer(): void {
    if (!this.stopFallbackTimer) {
      return;
    }

    clearTimeout(this.stopFallbackTimer);
    this.stopFallbackTimer = null;
  }

  private clearWarmupTimer(): void {
    if (!this.warmupTimer) {
      return;
    }

    clearTimeout(this.warmupTimer);
    this.warmupTimer = null;
  }

  private resolveScanResult(normalizedTranscript: string, ranges: BillRange[]): ScanResult {
    return this.validationService.validate(normalizedTranscript, ranges, this.denominationSelected);
  }
}
