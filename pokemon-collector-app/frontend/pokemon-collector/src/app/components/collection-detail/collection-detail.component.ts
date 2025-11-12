import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CollectionService } from '../../services/collection.service';
import { Collection, CollectionCard, Card } from '../../models';
import { getRarityIconPath } from '../../constants/rarity-symbols';
import { AddCardsModalComponent } from '../add-cards-modal';
import { CardNumberPipe } from '../../pipes/card-number.pipe';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-collection-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddCardsModalComponent,
    CardNumberPipe,
    ConfirmationModalComponent,
  ],
  templateUrl: './collection-detail.component.html',
  styleUrls: ['./collection-detail.component.css'],
})
export class CollectionDetailComponent implements OnInit {
  collection: Collection | null = null;
  loading = false;
  showAddCardsModal = false;

  totalCards = 0;
  ownedCards = 0;

  // UI Settings
  showPreview: boolean = false;

  // Selection mode for custom collections
  selectionMode = false;

  // Confirmation modal
  showConfirmModal = false;
  confirmModalTitle = '';
  confirmModalMessage = '';
  confirmModalType: 'danger' | 'warning' | 'info' = 'warning';
  pendingAction: (() => void) | null = null;
  selectedCardIds = new Set<number>();

  // Filters
  filterType: string = ''; // '', 'POKEMON', 'TRAINER', 'ENERGY'
  filterRarity: string = ''; // '' or rarity code
  filterPokemonType: string = ''; // '' or pokemon type code
  showOnlyOwned: boolean = false; // Toggle para "Solo las que tengo"
  showOnlyMissing: boolean = false; // Toggle para "Solo las que faltan"

  // Sorting - combinado en un solo valor
  sortOption: string = 'number-asc'; // number-asc, number-desc, name-asc, name-desc, rarity-asc, rarity-desc

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

  // Filtered cards
  filteredCards: CollectionCard[] = [];

  // Available rarities for filter dropdown
  availableRarities: { id: number; code: string; name: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private collectionService: CollectionService
  ) {
    // Cargar preferencia de preview desde localStorage
    const savedPreview = localStorage.getItem('collection-preview');
    if (savedPreview !== null) {
      this.showPreview = savedPreview === 'true';
    }
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCollection(parseInt(id));
    }
  }

  loadCollection(id: number) {
    this.loading = true;
    this.collectionService.getById(id).subscribe({
      next: (data) => {
        this.collection = data;

        // Ordenar las cartas por número correctamente (1, 2, 3... 10, 11... no 1, 10, 100)
        if (this.collection.collectionCards) {
          this.collection.collectionCards.sort((a, b) => {
            const numA = parseInt(a.card.number);
            const numB = parseInt(b.card.number);

            // Si ambos son números válidos, comparar como números
            if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB;
            }

            // Si solo uno es número, el número va primero
            if (!isNaN(numA)) return -1;
            if (!isNaN(numB)) return 1;

            // Si ninguno es número, comparar como strings
            return a.card.number.localeCompare(b.card.number);
          });
        }

        this.calculateStats();
        this.extractAvailableRarities();
        this.applyFilters();

        

        this.loading = false;
      },
      error: (error) => {
        alert('Error al cargar la colección');
        this.router.navigate(['/collections']);
        this.loading = false;
      },
    });
  }

  calculateStats() {
    if (!this.collection) return;

    this.totalCards = this.collection.collectionCards?.length || 0;
    this.ownedCards =
      this.collection.collectionCards?.filter((cc) => cc.quantity > 0).length ||
      0;
  }

  toggleCardVersion(
    collectionCard: CollectionCard,
    variant: 'normal' | 'reverse' | 'holo' | 'firstEdition'
  ) {
    if (!this.collection) return;

    // Toggle la variante específica
    let newValue = false;
    const updateData: any = {};

    switch (variant) {
      case 'normal':
        newValue = !collectionCard.ownedNormal;
        updateData.ownedNormal = newValue;
        break;
      case 'reverse':
        newValue = !collectionCard.ownedReverse;
        updateData.ownedReverse = newValue;
        break;
      case 'holo':
        newValue = !collectionCard.ownedHolo;
        updateData.ownedHolo = newValue;
        break;
      case 'firstEdition':
        newValue = !collectionCard.ownedFirstEdition;
        updateData.ownedFirstEdition = newValue;
        break;
    }

    this.collectionService
      .updateCardQuantity(this.collection.id, collectionCard.cardId, updateData)
      .subscribe({
        next: (updatedCard) => {
          // Actualizar el collectionCard con los nuevos valores de la BD
          collectionCard.ownedNormal = updatedCard.ownedNormal;
          collectionCard.ownedReverse = updatedCard.ownedReverse;
          collectionCard.ownedHolo = updatedCard.ownedHolo;
          collectionCard.ownedFirstEdition = updatedCard.ownedFirstEdition;
          collectionCard.quantity = updatedCard.quantity;
          this.calculateStats();
          this.applyFilters();
        },
        error: (error) => {
          alert('Error al actualizar la carta');
        },
      });
  }

  isVersionChecked(
    collectionCard: CollectionCard,
    variant: 'normal' | 'reverse' | 'holo' | 'firstEdition'
  ): boolean {
    switch (variant) {
      case 'normal':
        return collectionCard.ownedNormal;
      case 'reverse':
        return collectionCard.ownedReverse;
      case 'holo':
        return collectionCard.ownedHolo;
      case 'firstEdition':
        return collectionCard.ownedFirstEdition;
      default:
        return false;
    }
  }

  getCompletionPercentage(): number {
    if (this.totalCards === 0) return 0;
    return Math.round((this.ownedCards / this.totalCards) * 100);
  }

  goBack() {
    this.router.navigate(['/collections']);
  }

  getRarityIconPath(rarityCode: string): string {
    return getRarityIconPath(rarityCode);
  }

  onPreviewToggle(): void {
    localStorage.setItem('collection-preview', this.showPreview.toString());
  }

  // Métodos para verificar si una carta tiene disponible cada variante
  hasVariant(
    card: Card,
    variant: 'normal' | 'reverse' | 'holo' | 'firstEdition'
  ): boolean {
    switch (variant) {
      case 'normal':
        return card.hasNormalVariant;
      case 'reverse':
        return card.hasReverseVariant;
      case 'holo':
        return card.hasHoloVariant;
      case 'firstEdition':
        return card.hasFirstEditionVariant;
      default:
        return false;
    }
  }

  extractAvailableRarities(): void {
    if (!this.collection?.collectionCards) return;

    const rarityMap = new Map<string, { id: number; name: string }>();
    this.collection.collectionCards.forEach((cc) => {
      if (cc.card.rarity && cc.card.rarity.id) {
        rarityMap.set(cc.card.rarity.code, {
          id: cc.card.rarity.id,
          name: cc.card.rarity.name,
        });
      }
    });

    this.availableRarities = Array.from(rarityMap.entries())
      .map(([code, data]) => ({ id: data.id, code, name: data.name }))
      .sort((a, b) => a.id - b.id);
  }

  applyFilters(): void {
    if (!this.collection?.collectionCards) {
      this.filteredCards = [];
      return;
    }

    let filtered = [...this.collection.collectionCards];

    // Filter by type
    if (this.filterType) {
      filtered = filtered.filter((cc) => cc.card.type === this.filterType);

      // Si es tipo Pokémon y hay un tipo de Pokémon seleccionado, filtrar por él también
      if (this.filterType === 'POKEMON' && this.filterPokemonType) {
        filtered = filtered.filter((cc) => {
          // Convertir ambos a Title Case para comparar (Fire === Fire, FIRE === Fire, etc)
          const cardType = cc.card.pokemonType
            ? cc.card.pokemonType.charAt(0).toUpperCase() +
              cc.card.pokemonType.slice(1).toLowerCase()
            : '';
          const filterType =
            this.filterPokemonType.charAt(0).toUpperCase() +
            this.filterPokemonType.slice(1).toLowerCase();
          return cardType === filterType;
        });
      }
    }

    // Filter by rarity
    if (this.filterRarity) {
      filtered = filtered.filter(
        (cc) => cc.card.rarity?.code === this.filterRarity
      );
    }

    // Filter by owned status - Solo las que tengo
    if (this.showOnlyOwned) {
      filtered = filtered.filter((cc) => cc.quantity > 0);
    }

    // Filter by missing status - Solo las que faltan (considera todas las variantes)
    if (this.showOnlyMissing) {
      filtered = filtered.filter((cc) => {
        // Una carta "falta" si no tengo alguna de sus variantes disponibles
        const missingVariants = [];

        if (cc.card.hasNormalVariant && !cc.ownedNormal)
          missingVariants.push('normal');
        if (cc.card.hasReverseVariant && !cc.ownedReverse)
          missingVariants.push('reverse');
        if (cc.card.hasHoloVariant && !cc.ownedHolo)
          missingVariants.push('holo');
        if (cc.card.hasFirstEditionVariant && !cc.ownedFirstEdition)
          missingVariants.push('firstEdition');

        // Si falta al menos una variante, la carta se muestra como "falta"
        return missingVariants.length > 0;
      });
    }

    // Aplicar ordenación
    this.applySorting(filtered);
  }

  applySorting(cards: CollectionCard[]): void {
    // Separar sortOption en sortBy y sortOrder
    const [sortBy, sortOrder] = this.sortOption.split('-') as [
      'number' | 'name' | 'rarity',
      'asc' | 'desc'
    ];

    cards.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.card.name.localeCompare(b.card.name);
          break;

        case 'rarity':
          // Ordenar por ID de rareza (que ya tiene un orden lógico)
          const rarityA = a.card.rarity?.id || 0;
          const rarityB = b.card.rarity?.id || 0;
          comparison = rarityA - rarityB;
          break;

        case 'number':
        default:
          // Ordenación por número (ya existente)
          const numA = parseInt(a.card.number);
          const numB = parseInt(b.card.number);

          if (!isNaN(numA) && !isNaN(numB)) {
            comparison = numA - numB;
          } else if (!isNaN(numA)) {
            comparison = -1;
          } else if (!isNaN(numB)) {
            comparison = 1;
          } else {
            comparison = a.card.number.localeCompare(b.card.number);
          }
          break;
      }

      // Aplicar orden ascendente o descendente
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    this.filteredCards = cards;
  }

  onTypeFilter(): void {
    this.applyFilters();
  }

  onRarityFilter(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterType = '';
    this.filterRarity = '';
    this.filterPokemonType = '';
    this.showOnlyOwned = false;
    this.showOnlyMissing = false;
    this.sortOption = 'number-asc';
    this.applyFilters();
  }

  // Add cards modal methods
  openAddCardsModal(): void {
    this.showAddCardsModal = true;
  }

  closeAddCardsModal(): void {
    this.showAddCardsModal = false;
  }

  onCardsAdded(cardIds: number[]): void {
    if (!this.collection || cardIds.length === 0) return;

    this.collectionService.addCards(this.collection.id, { cardIds }).subscribe({
      next: () => {
        this.showAddCardsModal = false;
        // Reload collection to show newly added cards
        this.loadCollection(this.collection!.id);
      },
      error: (error) => {
        console.error('Error adding cards:', error);
        alert('Error al añadir las cartas a la colección');
      },
    });
  }

  isCustomCollection(): boolean {
    return this.collection?.type === 'CUSTOM';
  }

  removeCardFromCollection(cardId: number): void {
    if (!this.collection || !this.isCustomCollection()) return;

    this.confirmModalTitle = 'Eliminar carta';
    this.confirmModalMessage =
      '¿Estás seguro de que deseas eliminar esta carta de la colección?';
    this.confirmModalType = 'danger';
    this.showConfirmModal = true;

    this.pendingAction = () => {
      this.collectionService.removeCard(this.collection!.id, cardId).subscribe({
        next: () => {
          this.loadCollection(this.collection!.id);
        },
        error: (error) => {
          console.error('Error removing card:', error);
          alert('Error al eliminar la carta de la colección');
        },
      });
    };
  }

  // Selection mode methods
  toggleSelectionMode(): void {
    this.selectionMode = !this.selectionMode;
    if (!this.selectionMode) {
      this.selectedCardIds.clear();
    }
  }

  toggleCardSelection(cardId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (this.selectedCardIds.has(cardId)) {
      this.selectedCardIds.delete(cardId);
    } else {
      this.selectedCardIds.add(cardId);
    }
  }

  isCardSelected(cardId: number): boolean {
    return this.selectedCardIds.has(cardId);
  }

  toggleSelectAll(): void {
    if (this.selectedCardIds.size === this.filteredCards.length) {
      // Si todas están seleccionadas, deseleccionar todas
      this.selectedCardIds.clear();
    } else {
      // Seleccionar todas las cartas filtradas
      this.filteredCards.forEach((cc) => this.selectedCardIds.add(cc.card.id));
    }
  }

  removeSelectedCards(): void {
    if (!this.collection || this.selectedCardIds.size === 0) return;

    this.confirmModalTitle = 'Eliminar cartas';
    this.confirmModalMessage = `¿Estás seguro de que deseas eliminar ${this.selectedCardIds.size} carta(s) de la colección?`;
    this.confirmModalType = 'danger';
    this.showConfirmModal = true;

    this.pendingAction = () => {
      const deletePromises = Array.from(this.selectedCardIds).map((cardId) =>
        this.collectionService
          .removeCard(this.collection!.id, cardId)
          .toPromise()
      );

      Promise.all(deletePromises)
        .then(() => {
          this.selectedCardIds.clear();
          this.selectionMode = false;
          this.loadCollection(this.collection!.id);
        })
        .catch((error) => {
          console.error('Error removing cards:', error);
          alert('Error al eliminar algunas cartas');
        });
    };
  }

  onConfirmAction() {
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
    this.showConfirmModal = false;
  }

  onCancelAction() {
    this.pendingAction = null;
    this.showConfirmModal = false;
  }

  getCollectionCardHoverImage(collectionCard: CollectionCard): string {
    const card = collectionCard.card;
    if (card.largeImageUrl && !card.largeImageUrl.includes('undefined')) {
      return `url(${card.largeImageUrl})`;
    }
    if (card.imageUrl && !card.imageUrl.includes('undefined')) {
      return `url(${card.imageUrl})`;
    }
    return 'url(images/cards/placeholder.png)';
  }

  getCollectionCardImage(collectionCard: CollectionCard): string {
    const card = collectionCard.card;
    return card.imageUrl && !card.imageUrl.includes('undefined')
      ? card.imageUrl
      : 'images/cards/placeholder.png';
  }
}
