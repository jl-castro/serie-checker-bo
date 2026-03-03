import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranscriptNormalizerService {
  private readonly tokenToDigit: Record<string, string> = {
    cero: '0',
    uno: '1',
    un: '1',
    una: '1',
    dos: '2',
    tres: '3',
    cuatro: '4',
    cinco: '5',
    seis: '6',
    siete: '7',
    ocho: '8',
    nueve: '9'
  };

  normalizeToSerialInput(raw: string): string {
    const cleaned = raw.replace(/[^0-9A-Za-zÁÉÍÓÚÜáéíóúüñÑ\s]/g, ' ');
    const tokens = cleaned
      .toLowerCase()
      .split(/\s+/)
      .filter((token) => token.length > 0);
    const mapped = tokens.map((token) => this.tokenToDigit[token] ?? token).join('');
    return mapped.replace(/[^0-9]/g, '').slice(0, 9);
  }
}
