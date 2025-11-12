import { Series } from './series.model';

export interface Set {
  id: number;
  seriesId: number;
  name: string;
  code: string;
  releaseDate: Date;
  totalCards: number;
  description?: string;
  logoUrl?: string;
  symbolUrl?: string;
  series?: Series;
  _count?: {
    cards: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
