import { Set } from './set.model';
import { Card } from './card.model';

export interface Collection {
  id: number;
  name: string;
  description?: string;
  type: string;
  setId?: number;
  set?: Set;
  collectionCards?: CollectionCard[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionCard {
  id: number;
  collectionId: number;
  cardId: number;
  quantity: number;
  // Variantes que el usuario posee
  ownedNormal: boolean;
  ownedReverse: boolean;
  ownedHolo: boolean;
  ownedFirstEdition: boolean;
  createdAt: Date;
  updatedAt: Date;
  card: Card;
}
