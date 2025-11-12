import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Set } from '../models';
import { environment } from '../../environments/environment';

export interface AvailableSet {
  id: string;
  name: string;
  cardCount: number;
  logo: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  private apiUrl = `${environment.apiUrl}/import`;

  constructor(private http: HttpClient) {}

  // GET /api/import/sets-catalog - Obtener lista de sets disponibles
  getAvailableSets(): Observable<AvailableSet[]> {
    return this.http.get<AvailableSet[]>(`${this.apiUrl}/sets-catalog`);
  }

  // POST /api/import/set - Importar un set desde TCGdex
  importSet(setId: string): Observable<{ message: string; set: Set }> {
    return this.http.post<{ message: string; set: Set }>(`${this.apiUrl}/set`, { setId });
  }
}
