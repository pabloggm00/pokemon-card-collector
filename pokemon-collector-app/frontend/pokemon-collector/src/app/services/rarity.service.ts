import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rarity } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RarityService {
  private apiUrl = `${environment.apiUrl}/rarities`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Rarity[]> {
    return this.http.get<Rarity[]>(this.apiUrl);
  }

  getById(id: number): Observable<Rarity> {
    return this.http.get<Rarity>(`${this.apiUrl}/${id}`);
  }

  create(rarity: Partial<Rarity>): Observable<Rarity> {
    return this.http.post<Rarity>(this.apiUrl, rarity);
  }

  update(id: number, rarity: Partial<Rarity>): Observable<Rarity> {
    return this.http.put<Rarity>(`${this.apiUrl}/${id}`, rarity);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
