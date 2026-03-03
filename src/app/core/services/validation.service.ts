import { Injectable } from '@angular/core';
import { DISABLED_SERIES } from '../constants/series.constants';
import { BillRange } from '../models/range.model';
import { ScanResult } from '../models/scan-result.model';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  constructor() {}

  validate(input: string, ranges: BillRange[], denomination: 10 | 20 | 50 | 'AUTO'): ScanResult {
    const normalized = input.trim().toUpperCase();
    const letters = normalized.match(/[A-Z]/g) ?? [];
    const series = letters.length > 0 ? letters[letters.length - 1] : DISABLED_SERIES;
    const serialGroup = normalized.match(/\d{6,}/)?.[0];
    const serialNumber = serialGroup ? Number.parseInt(serialGroup, 10) : undefined;
    const serialNormalized = serialNumber !== undefined ? `${serialNumber}`.padStart(9, '0') : undefined;

    if (serialNumber === undefined || Number.isNaN(serialNumber)) {
      return {
        input,
        series,
        denominationSelected: denomination,
        status: 'UNKNOWN',
        timestamp: Date.now(),
        message: 'No se pudo leer el número.'
      };
    }

    if (series !== DISABLED_SERIES) {
      return {
        input,
        series,
        serialNumber,
        serialNormalized,
        denominationSelected: denomination,
        status: 'VALID',
        timestamp: Date.now(),
        message: 'Esta app valida la serie B. La serie ingresada no está marcada como inhabilitada.'
      };
    }

    const bRanges = ranges.filter((range) => range.series.toUpperCase() === DISABLED_SERIES);

    if (denomination !== 'AUTO') {
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

    const matchedDenominations = Array.from(
      new Set(
        bRanges
          .filter((range) => serialNumber >= range.from && serialNumber <= range.to)
          .map((range) => range.denomination)
      )
    ).sort((a, b) => a - b);

    if (matchedDenominations.length === 0) {
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

    if (matchedDenominations.length === 1) {
      return {
        input,
        series,
        serialNumber,
        serialNormalized,
        denominationSelected: denomination,
        denominationMatched: matchedDenominations[0],
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
      matches: matchedDenominations.map((value) => ({ denomination: value })),
      status: 'AMBIGUOUS',
      timestamp: Date.now(),
      message: 'Coincide con más de una denominación. Selecciona la denominación del billete.'
    };
  }
}
