export type ScanStatus = 'VALID' | 'INVALID' | 'UNKNOWN';

export interface ScanResult {
  input: string;
  series: string;
  serialNumber?: number;
  serialNormalized?: string;
  denominationSelected?: 10 | 20 | 50;
  denominationMatched?: number;
  status: ScanStatus;
  timestamp: number;
  message: string;
}
