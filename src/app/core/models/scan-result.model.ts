export type ScanStatus = 'VALID' | 'INVALID' | 'UNKNOWN';

export interface ScanResult {
  serial: number;
  denomination?: number;
  status: ScanStatus;
  timestamp: number;
}
