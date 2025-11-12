import { Set } from './set.model';

export interface Series {
  id: number;
  name: string;
  code: string;
  releaseDate: Date;
  logoUrl?: string;
  description?: string;
  sets?: Set[];
  createdAt: Date;
  updatedAt: Date;
}
