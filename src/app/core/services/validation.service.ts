import { Injectable } from '@angular/core';
import { DISABLED_SERIES } from '../constants/series.constants';
import { BillRange } from '../models/range.model';
import { ScanResult } from '../models/scan-result.model';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  constructor() {}

  validate(input: string, ranges: BillRange[], denomination: 10 | 20 | 50): ScanResult {
    const normalized = input.trim().toUpperCase();
    const series = DISABLED_SERIES;
    const isNumericInput = /^\d{1,9}$/.test(normalized);
    const serialNumber = isNumericInput ? Number.parseInt(normalized, 10) : undefined;
    const serialNormalized = serialNumber !== undefined ? `${serialNumber}`.padStart(9, '0') : undefined;

    if (serialNumber === undefined || Number.isNaN(serialNumber)) {
      return {
        input,
        series,
        denominationSelected: denomination,
        status: 'UNKNOWN',
        timestamp: Date.now(),
        message: 'Ingresa solo dígitos (máximo 9).'
      };
    }

    const bRanges = ranges.filter((range) => range.series.toUpperCase() === DISABLED_SERIES);
    const matchesSelected = bRanges.some(
      (range) =>
        range.denomination === denomination &&
        serialNumber >= range.from &&
        serialNumber <= range.to
    );

    if (matchesSelected) {
      return {
        input,
        series,
        serialNumber,
        serialNormalized,
        denominationSelected: denomination,
        denominationMatched: denomination,
        status: 'INVALID',
        timestamp: Date.now(),
        message: 'Serie inhabilitada (rango reportado).'
      };
    }

    return {
      input,
      series,
      serialNumber,
      serialNormalized,
      denominationSelected: denomination,
      status: 'VALID',
      timestamp: Date.now(),
      message: 'No está en los rangos inhabilitados conocidos.'
    };
  }
}
