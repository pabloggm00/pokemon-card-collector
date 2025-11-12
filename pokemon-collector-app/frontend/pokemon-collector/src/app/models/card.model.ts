export interface Card {
  id: number;
  setId: number;
  name: string;
  number: string;
  rarityId: number;
  type: 'POKEMON' | 'TRAINER' | 'ENERGY';
  subtype?: string; // EX, VSTAR, VMAX, etc.
  pokemonType?: string; // Grass, Fire, Water, etc.
  artist?: string;
  imageUrl?: string;
  largeImageUrl?: string;
  description?: string;
  // Variantes disponibles de la carta
  hasNormalVariant: boolean;
  hasReverseVariant: boolean;
  hasHoloVariant: boolean;
  hasFirstEditionVariant: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  rarity?: {
    id: number;
    name: string;
    code: string;
    color?: string;
  };
  set?: {
    name: string;
    code: string;
    logoUrl?: string;
    symbolUrl?: string;
  };
}

export interface CardsResponse {
  cards: Card[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
