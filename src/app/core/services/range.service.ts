import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, of } from 'rxjs';
import { BillRange } from '../models/range.model';

interface RangesResponse {
  lastUpdated: string;
  currency: string;
  ranges: BillRange[];
}

@Injectable({
  providedIn: 'root'
})
export class RangeService {
  private snapshot: BillRange[] = [];

  constructor(private readonly http: HttpClient) {}

  load(): Observable<BillRange[]> {
    return this.http.get<RangesResponse>('/data/ranges.json').pipe(
      map((response) => response.ranges ?? []),
      tap((ranges) => {
        this.snapshot = ranges;
      })
    );
  }

  getSnapshot(): BillRange[] {
    return this.snapshot;
  }

  isLoaded(): boolean {
    return this.snapshot.length > 0;
  }

  loadOnce(): Observable<BillRange[]> {
    if (this.isLoaded()) {
      return of(this.snapshot);
    }

    return this.load();
  }
}
