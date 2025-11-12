import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Set } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SetService {
  private apiUrl = `${environment.apiUrl}/sets`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Set[]> {
    return this.http.get<Set[]>(this.apiUrl);
  }

  getById(id: number): Observable<Set> {
    return this.http.get<Set>(`${this.apiUrl}/${id}`);
  }

  getBySeries(seriesId: number): Observable<Set[]> {
    return this.http.get<Set[]>(`${this.apiUrl}/series/${seriesId}`);
  }

  create(set: Partial<Set>): Observable<Set> {
    return this.http.post<Set>(this.apiUrl, set);
  }

  update(id: number, set: Partial<Set>): Observable<Set> {
    return this.http.put<Set>(`${this.apiUrl}/${id}`, set);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
