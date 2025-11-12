import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Series } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SeriesService {
  private apiUrl = `${environment.apiUrl}/series`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Series[]> {
    return this.http.get<Series[]>(this.apiUrl);
  }

  getById(id: number): Observable<Series> {
    return this.http.get<Series>(`${this.apiUrl}/${id}`);
  }

  create(series: Partial<Series>): Observable<Series> {
    return this.http.post<Series>(this.apiUrl, series);
  }

  update(id: number, series: Partial<Series>): Observable<Series> {
    return this.http.put<Series>(`${this.apiUrl}/${id}`, series);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
