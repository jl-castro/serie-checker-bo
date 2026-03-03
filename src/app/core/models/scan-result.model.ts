export type ScanStatus = 'VALID' | 'INVALID' | 'UNKNOWN' | 'AMBIGUOUS';

export interface ScanResult {
  input: string;
  series: string;
  serialNumber?: number;
  serialNormalized?: string;
  denominationSelected?: 10 | 20 | 50 | 'AUTO';
  denominationMatched?: number;
  matches?: Array<{ denomination: number }>;
  status: ScanStatus;
  timestamp: number;
  message: string;
}
