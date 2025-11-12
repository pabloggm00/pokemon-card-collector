import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Collection } from '../models';
import { environment } from '../../environments/environment';

export interface CreateCollectionRequest {
  setId: number;
}

export interface CreateCustomCollectionRequest {
  name: string;
  description?: string;
}

export interface AddCardsToCollectionRequest {
  cardIds: number[];
}

export interface UpdateCardQuantityRequest {
  quantity?: number;
  ownedNormal?: boolean;
  ownedReverse?: boolean;
  ownedHolo?: boolean;
  ownedFirstEdition?: boolean;
}

export interface CollectionWithStats extends Collection {
  totalCards: number;
  ownedCards: number;
}

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private apiUrl = `${environment.apiUrl}/collections`;

  constructor(private http: HttpClient) {}

  // GET /api/collections - Listar todas las colecciones con estadísticas
  getAll(): Observable<CollectionWithStats[]> {
    return this.http.get<CollectionWithStats[]>(this.apiUrl);
  }

  // GET /api/collections/:id - Obtener detalle de una colección con todas sus cartas
  getById(id: number): Observable<Collection> {
    return this.http.get<Collection>(`${this.apiUrl}/${id}`);
  }

  // POST /api/collections - Crear una nueva colección desde un set
  create(data: CreateCollectionRequest): Observable<Collection> {
    return this.http.post<Collection>(this.apiUrl, data);
  }

  // POST /api/collections/custom - Crear una colección personalizada
  createCustom(data: CreateCustomCollectionRequest): Observable<Collection> {
    return this.http.post<Collection>(`${this.apiUrl}/custom`, data);
  }

  // POST /api/collections/:id/cards - Añadir cartas a una colección personalizada
  addCards(collectionId: number, data: AddCardsToCollectionRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/${collectionId}/cards`, data);
  }

  // DELETE /api/collections/:id/cards/:cardId - Eliminar una carta de una colección personalizada
  removeCard(collectionId: number, cardId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${collectionId}/cards/${cardId}`);
  }

  // PATCH /api/collections/:id/cards/:cardId - Actualizar versiones de una carta
  updateCardQuantity(collectionId: number, cardId: number, data: UpdateCardQuantityRequest): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${collectionId}/cards/${cardId}`, data);
  }

  // DELETE /api/collections/:id - Eliminar una colección
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
