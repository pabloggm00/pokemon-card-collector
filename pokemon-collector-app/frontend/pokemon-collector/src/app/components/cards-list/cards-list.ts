import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CardService, CardFilters } from '../../services/card.service';
import { RarityService } from '../../services/rarity.service';
import { SetService } from '../../services/set.service';
import { Card, Rarity, Set } from '../../models';
import { CardNamePipe } from '../../pipes/card-name.pipe';
import { CardNumberPipe } from '../../pipes/card-number.pipe';
import { getPokemonTypeColor } from '../../constants/pokemon-types';
import {
  getRaritySymbol,
  getRarityColor,
  getRarityIconPath,
} from '../../constants/rarity-symbols';

@Component({
  selector: 'app-cards-list',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CardNamePipe,
    CardNumberPipe,
  ],
  templateUrl: './cards-list.html',
  styleUrl: './cards-list.css',
})
export class CardsList implements OnInit {
  cards: Card[] = [];
  rarities: Rarity[] = [];
  sets: Set[] = [];
  loading: boolean = false;
  error: string | null = null;

  // Pagination
  currentPage: number = 1;
  limit: number = 24;
  total: number = 0;
  totalPages: number = 0;
  hasMore: boolean = false;

  // UI Settings
  showPreview: boolean = false;

  // Filters
  filters: CardFilters = {
    page: 1,
    limit: 24,
  };
  searchTerm: string = '';
  selectedCardType: string = '';
  selectedPokemonType: string = '';
  selectedRarity: string = '';
  selectedSet: string = '';

  // Subject para búsqueda automática con debounce
  private searchSubject = new Subject<string>();

  // Lista de tipos de Pokémon disponibles
  pokemonTypes = [
    { code: 'COLORLESS', name: 'Normal' },
    { code: 'GRASS', name: 'Planta' },
    { code: 'FIRE', name: 'Fuego' },
    { code: 'WATER', name: 'Agua' },
    { code: 'LIGHTNING', name: 'Eléctrico' },
    { code: 'FIGHTING', name: 'Lucha' },
    { code: 'PSYCHIC', name: 'Psíquico' },
    { code: 'DARKNESS', name: 'Siniestro' },
    { code: 'METAL', name: 'Acero' },
    { code: 'FAIRY', name: 'Hada' },
    { code: 'DRAGON', name: 'Dragón' },
  ];

  constructor(
    private cardService: CardService,
    private rarityService: RarityService,
    private setService: SetService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Cargar preferencia de preview desde localStorage
    const savedPreview = localStorage.getItem('cards-preview');
    if (savedPreview !== null) {
      this.showPreview = savedPreview === 'true';
    }
  }

  ngOnInit(): void {
    this.loadRarities();
    this.loadSets();

    // Configurar búsqueda automática con debounce
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.filters.search = searchTerm || undefined;
      this.currentPage = 1;
      this.filters.page = 1;
      this.updateUrlAndLoadCards();
    });

    // Solo usar queryParams para todos los filtros (incluyendo set)
    this.route.queryParams.subscribe((params) => {
      // Leer página
      this.currentPage = params['page'] ? +params['page'] : 1;
      this.filters.page = this.currentPage;

      // Leer búsqueda
      if (params['search']) {
        this.searchTerm = params['search'];
        this.filters.search = params['search'];
      } else {
        this.searchTerm = '';
        this.filters.search = undefined;
      }

      // Leer tipo de carta
      if (params['type']) {
        this.selectedCardType = params['type'];
        this.filters.type = params['type'] as any;
      } else {
        this.selectedCardType = '';
        this.filters.type = undefined;
      }

      // Leer tipo de Pokémon
      if (params['pokemonType']) {
        this.selectedPokemonType = params['pokemonType'];
        this.filters.pokemonType = params['pokemonType'] as any;
      } else {
        this.selectedPokemonType = '';
        this.filters.pokemonType = undefined;
      }

      // Leer rareza
      if (params['rarity']) {
        this.selectedRarity = params['rarity'];
        this.filters.rarityId = +params['rarity'];
      } else {
        this.selectedRarity = '';
        this.filters.rarityId = undefined;
      }

      // Leer set
      if (params['set']) {
        this.selectedSet = params['set'];
        this.filters.setId = +params['set'];
      } else {
        this.selectedSet = '';
        this.filters.setId = undefined;
      }

      this.loadCards();
    });
  }

  loadRarities(): void {
    this.rarityService.getAll().subscribe({
      next: (data) => {
        this.rarities = data;
      },
      error: (err) => {
        // Silently handle error
      },
    });
  }

  loadSets(): void {
    this.setService.getAll().subscribe({
      next: (data) => {
        this.sets = data;
      },
      error: (err) => {
        // Silently handle error
      },
    });
  }

  loadCards(): void {
    this.loading = true;
    this.error = null;

    this.cardService.getAll(this.filters).subscribe({
      next: (response) => {
        this.cards = response.cards;
        this.currentPage = response.pagination.page;
        this.total = response.pagination.total;
        this.totalPages = response.pagination.totalPages;
        this.hasMore = response.pagination.hasMore;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las cartas';
        this.loading = false;
      },
    });
  }

  updateUrlParams(): void {
    const queryParams: any = {};

    if (this.filters.page && this.filters.page > 1) {
      queryParams.page = this.filters.page;
    }
    if (this.filters.search) {
      queryParams.search = this.filters.search;
    }
    if (this.filters.type) {
      queryParams.type = this.filters.type;
    }
    if (this.filters.pokemonType) {
      queryParams.pokemonType = this.filters.pokemonType;
    }
    if (this.filters.rarityId) {
      queryParams.rarity = this.filters.rarityId;
    }
    if (this.filters.setId) {
      queryParams.set = this.filters.setId;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      replaceUrl: true, // Usar replaceUrl en vez de merge
    });
  }

  // Método para búsqueda automática
  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  // Método antiguo de búsqueda (ya no se usa con debounce, pero lo mantenemos por compatibilidad)
  onSearch(): void {
    this.filters.search = this.searchTerm || undefined;
    this.filters.page = 1;
    this.updateUrlParams();
  }

  // Método auxiliar para actualizar URL y cargar cartas
  private updateUrlAndLoadCards(): void {
    this.updateUrlParams();
  }

  onCardTypeFilter(): void {
    this.filters.type = (this.selectedCardType as any) || undefined;
    if (this.selectedCardType !== 'POKEMON') {
      // Si no es Pokémon, limpiar el tipo de Pokémon
      this.selectedPokemonType = '';
      this.filters.pokemonType = undefined;
    }
    this.filters.page = 1;
    this.updateUrlParams();
  }

  onPokemonTypeFilter(): void {
    this.filters.pokemonType = this.selectedPokemonType || undefined;
    this.filters.page = 1;
    this.updateUrlParams();
  }

  onRarityFilter(): void {
    this.filters.rarityId = this.selectedRarity
      ? +this.selectedRarity
      : undefined;
    this.filters.page = 1;
    this.updateUrlParams();
  }

  onSetFilter(): void {
    this.filters.setId = this.selectedSet ? +this.selectedSet : undefined;
    this.filters.page = 1;
    this.updateUrlParams();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCardType = '';
    this.selectedPokemonType = '';
    this.selectedRarity = '';
    this.selectedSet = '';
    this.filters = {
      page: 1,
      limit: this.limit,
    };
    this.updateUrlParams();
  }

  nextPage(): void {
    if (this.hasMore) {
      this.filters.page = this.currentPage + 1;
      this.updateUrlParams();
      // No llamar loadCards() porque updateUrlParams() desencadena queryParams.subscribe
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.filters.page = this.currentPage - 1;
      this.updateUrlParams();
      // No llamar loadCards() porque updateUrlParams() desencadena queryParams.subscribe
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.filters.page = page;
      this.updateUrlParams();
      // No llamar loadCards() porque updateUrlParams() desencadena queryParams.subscribe
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getVisiblePages(): number[] {
    const maxVisible = 10; // Máximo de páginas visibles
    const pages: number[] = [];

    if (this.totalPages <= maxVisible) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar páginas con lógica inteligente
      const halfVisible = Math.floor(maxVisible / 2);
      let startPage = Math.max(1, this.currentPage - halfVisible);
      let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);

      // Ajustar si estamos cerca del final
      if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
      }

      // Primera página siempre visible
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push(-1); // Indicador de "..."
        }
      }

      // Páginas del rango
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Última página siempre visible
      if (endPage < this.totalPages) {
        if (endPage < this.totalPages - 1) {
          pages.push(-1); // Indicador de "..."
        }
        pages.push(this.totalPages);
      }
    }

    return pages;
  }

  getCardTypeClass(type: string): string {
    return `card-type-${type.toLowerCase()}`;
  }

  getPokemonTypeColor(pokemonType: string | null | undefined): string {
    return getPokemonTypeColor(pokemonType);
  }

  getRaritySymbol(rarity: any): string {
    return getRaritySymbol(rarity?.code);
  }

  getRarityColor(rarity: any): string {
    return getRarityColor(rarity?.code);
  }

  getRarityIconPath(rarityCode: string): string {
    return getRarityIconPath(rarityCode);
  }

  onPreviewToggle(): void {
    localStorage.setItem('cards-preview', this.showPreview.toString());
  }

  onIconError(event: any, rarityCode: string): void {
    // Si la imagen falla al cargar, muestra el símbolo de texto como fallback
    const target = event.target as HTMLImageElement;
    const symbol = getRaritySymbol(rarityCode);
    const color = getRarityColor(rarityCode);

    // Reemplazar la imagen con un span
    const span = document.createElement('span');
    span.className = 'rarity-symbol';
    span.style.color = color;
    span.textContent = symbol;
    span.title = target.alt;

    target.parentNode?.replaceChild(span, target);
  }

  getCardBorderStyle(card: Card): string {
    // Pokémon - Color del tipo (sin gradientes)
    if (card.type === 'POKEMON' && card.pokemonType) {
      return getPokemonTypeColor(card.pokemonType);
    }

    // Trainer - Color cyan
    if (card.type === 'TRAINER') {
      return '#06b6d4';
    }

    // Energy - Color naranja
    if (card.type === 'ENERGY') {
      return '#f97316';
    }

    // Default
    return 'var(--border-color)';
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  // Método para obtener la imagen principal
  getCardImage(card: Card): string {
    if (card.imageUrl && !card.imageUrl.includes('undefined')) {
      return card.imageUrl;
    }
    return 'images/cards/placeholder.png';
  }

  getHoverImage(card: Card): string {
    if (card.largeImageUrl && !card.largeImageUrl.includes('undefined')) {
      return `url(${card.largeImageUrl})`;
    }
    if (card.imageUrl && !card.imageUrl.includes('undefined')) {
      return `url(${card.imageUrl})`;
    }
    return 'url(images/cards/placeholder.png)';
  }
}
