import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Card, CardsResponse } from '../models';
import { environment } from '../../environments/environment';

export interface CardFilters {
  page?: number;
  limit?: number;
  setId?: number;
  rarityId?: number;
  type?: 'POKEMON' | 'TRAINER' | 'ENERGY';
  pokemonType?: string;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private apiUrl = `${environment.apiUrl}/cards`;

  constructor(private http: HttpClient) {}

  getAll(filters?: CardFilters): Observable<CardsResponse> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.setId) params = params.set('setId', filters.setId.toString());
      if (filters.rarityId) params = params.set('rarityId', filters.rarityId.toString());
      if (filters.type) params = params.set('type', filters.type);
      if (filters.pokemonType) params = params.set('pokemonType', filters.pokemonType);
      if (filters.search) params = params.set('search', filters.search);
    }

    return this.http.get<CardsResponse>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Card> {
    return this.http.get<Card>(`${this.apiUrl}/${id}`);
  }

  create(card: Partial<Card>): Observable<Card> {
    return this.http.post<Card>(this.apiUrl, card);
  }

  update(id: number, card: Partial<Card>): Observable<Card> {
    return this.http.put<Card>(`${this.apiUrl}/${id}`, card);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
