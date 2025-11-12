import { Routes } from '@angular/router';
import { SeriesList } from './components/series-list/series-list';
import { SetsList } from './components/sets-list/sets-list';
import { CardsList } from './components/cards-list/cards-list';
import { CollectionsListComponent } from './components/collections-list/collections-list.component';
import { CollectionDetailComponent } from './components/collection-detail/collection-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: '/series', pathMatch: 'full' },
  { path: 'series', component: SeriesList },
  { path: 'sets', component: SetsList },
  { path: 'sets/:seriesId', component: SetsList },
  { path: 'cards', component: CardsList },
  { path: 'collections', component: CollectionsListComponent },
  { path: 'collections/:id', component: CollectionDetailComponent },
  { path: '**', redirectTo: '/series' }
];
